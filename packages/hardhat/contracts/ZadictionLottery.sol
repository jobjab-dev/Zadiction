// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/decryption/DecryptionOracleCaller.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ZadictionLottery
 * @notice Transparent Linear-Capped Lottery AMM
 * @dev Implements dynamic odds based on exposure to ensure solvency.
 *      Uses slippage-aware odds to prevent whale splitting.
 *      Uses Async FHEVM Decryption for secure on-chain RNG.
 */
contract ZadictionLottery is DecryptionOracleCaller, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    address public factory;
    address public owner;
    address public treasury;
    
    // Configuration (Locked at creation)
    uint256 public immutable roundId;
    uint8 public immutable digits; // 2 for 00-99, 3 for 000-999
    uint256 public immutable maxNumber; // 99 or 999
    
    uint256 public immutable betDeadline;
    
    uint256 public immutable collateral; // C
    uint256 public immutable liabilityLimit; // L = C * (1 - fee)
    uint256 public immutable initialOdds; // o0 (scaled by 100, e.g. 7000 = 70x)
    uint256 public immutable minOdds; // omin (scaled by 100)
    uint256 public immutable feePercent; // basis points (e.g. 500 = 5%)
    
    // State
    mapping(uint256 => uint256) public exposure; // E_i for each number
    mapping(uint256 => uint256) public totalStakes; // S_i for each number
    
    struct Bet {
        address player;
        uint256 number;
        uint256 amount;
        uint256 lockedOdds; // Locked odds at time of bet (Immutable)
        uint256 potentialPayout;
        bool claimed;
    }
    
    Bet[] public bets;
    mapping(address => uint256[]) public userBetIndices;
    
    bool public isResolved;
    uint256 public winningNumber;
    
    uint256 public totalUnclaimedPayouts; // Tracks liability to winners
    uint256 public drawRequestedAt; // Timestamp of RNG request
    
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event BetPlaced(address indexed player, uint256 number, uint256 amount, uint256 odds, uint256 potentialPayout);
    event DrawRequested(uint256 timestamp);
    event RoundResolved(uint256 winningNumber);
    event WinningsClaimed(address indexed player, uint256 amount);
    event CollateralWithdrawn(address indexed owner, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error Unauthorized();
    error RoundNotActive();
    error RoundEnded();
    error RoundNotEnded();
    error AlreadyResolved();
    error InvalidNumber();
    error ExceedsLimit(); // Solvency check failed
    error TransferFailed();
    error NothingToClaim();
    error DrawAlreadyRequested();
    error DrawNotRequested();
    error DrawTimeoutNotReached();
    error InvalidParams();

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyActive() {
        if (block.timestamp > betDeadline) revert RoundEnded();
        if (isResolved) revert AlreadyResolved();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _owner,
        uint256 _roundId,
        uint8 _digits,
        uint256 _betPeriod,
        uint256 _initialOdds,      // Scaled by 100 (e.g., 10000 = 100x)
        uint256 _minOdds,          // Scaled by 100
        uint256 _creatorFeePercent, // Basis points (e.g., 200 = 2%)
        uint256 _protocolFeePercent, // Basis points (e.g., 25 = 0.25%)
        address _protocolTreasury
    ) payable {
        // Sanity Checks
        if (msg.value == 0) revert InvalidParams();
        if (_digits != 2 && _digits != 3) revert InvalidParams();
        if (_initialOdds <= _minOdds) revert InvalidParams();
        if (_creatorFeePercent + _protocolFeePercent >= 10000) revert InvalidParams(); // Total fee < 100%
        
        factory = msg.sender;
        owner = _owner;
        roundId = _roundId;
        digits = _digits;
        maxNumber = (10 ** _digits) - 1;
        treasury = _owner; // Creator gets creator fee
        
        betDeadline = block.timestamp + _betPeriod;
        
        initialOdds = _initialOdds;
        minOdds = _minOdds;
        feePercent = _creatorFeePercent;
        
        collateral = msg.value;
        
        // Calculate Fees
        uint256 creatorFee = (msg.value * _creatorFeePercent) / 10000;
        uint256 protocolFee = (msg.value * _protocolFeePercent) / 10000;
        uint256 totalFee = creatorFee + protocolFee;
        
        liabilityLimit = msg.value - totalFee;
        
        // Transfer creator fee
        if (_owner != address(0) && creatorFee > 0) {
            (bool sent1, ) = payable(_owner).call{value: creatorFee}("");
            require(sent1, "Creator fee transfer failed");
        }
        
        // Transfer protocol fee
        if (_protocolTreasury != address(0) && protocolFee > 0) {
            (bool sent2, ) = payable(_protocolTreasury).call{value: protocolFee}("");
            require(sent2, "Protocol fee transfer failed");
        }
    }

    /*//////////////////////////////////////////////////////////////
                            CORE LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Calculate slippage-aware odds for a bet amount
     * @dev Uses midpoint approximation: avgExposure = E + (estimatedPayout / 2)
     *      finalOdds = max(omin, o0 * (1 - avgExposure / L))
     */
    function getOdds(uint256 number, uint256 amount) public view returns (uint256) {
        if (number > maxNumber) return 0;
        
        uint256 e_i = exposure[number];
        
        // 1. Calculate Current Odds (Spot Price)
        // currentOdds = o0 * (L - E) / L
        uint256 currentOdds;
        if (e_i >= liabilityLimit) {
            currentOdds = minOdds;
        } else {
            currentOdds = (initialOdds * (liabilityLimit - e_i)) / liabilityLimit;
            if (currentOdds < minOdds) currentOdds = minOdds;
        }
        
        // 2. Calculate Estimated Payout
        uint256 estimatedPayout = (amount * currentOdds) / 100;
        
        // 3. Calculate Average Exposure (Midpoint)
        uint256 avgExposure = e_i + (estimatedPayout / 2);
        
        // 4. Calculate Final Odds based on Average Exposure
        if (avgExposure >= liabilityLimit) {
            return minOdds;
        }
        
        uint256 finalOdds = (initialOdds * (liabilityLimit - avgExposure)) / liabilityLimit;
        
        return finalOdds < minOdds ? minOdds : finalOdds;
    }

    /**
     * @notice View function for UI to calculate max bet
     * @dev Returns approx max bet: (L - E) / currentOdds
     */
    function maxBet(uint256 number) external view returns (uint256) {
        if (number > maxNumber) return 0;
        uint256 e_i = exposure[number];
        if (e_i >= liabilityLimit) return 0;
        
        uint256 currentOdds = (initialOdds * (liabilityLimit - e_i)) / liabilityLimit;
        if (currentOdds < minOdds) currentOdds = minOdds;
        
        // (L - E) * 100 / Odds
        return ((liabilityLimit - e_i) * 100) / currentOdds;
    }

    /**
     * @notice Place a bet on a number
     */
    function placeBet(uint256 number) external payable onlyActive {
        if (number > maxNumber) revert InvalidNumber();
        if (msg.value == 0) revert TransferFailed();

        // 1. Calculate Final Odds (Slippage-Aware)
        uint256 lockedOdds = getOdds(number, msg.value);
        uint256 payout = (msg.value * lockedOdds) / 100;
        
        // 2. Solvency Check: E_i + payout <= L
        if (exposure[number] + payout > liabilityLimit) {
            revert ExceedsLimit();
        }

        // 3. Update State
        exposure[number] += payout;
        totalStakes[number] += msg.value;
        totalUnclaimedPayouts += payout; // Track liability
        
        bets.push(Bet({
            player: msg.sender,
            number: number,
            amount: msg.value,
            lockedOdds: lockedOdds,
            potentialPayout: payout,
            claimed: false
        }));
        
        userBetIndices[msg.sender].push(bets.length - 1);
        
        emit BetPlaced(msg.sender, number, msg.value, lockedOdds, payout);
    }

    /**
     * @notice Request Randomness for Draw (Async)
     * @dev Uses FHEVM Gateway
     */
    function drawResult() external {
        if (block.timestamp <= betDeadline) revert RoundNotEnded();
        if (isResolved) revert AlreadyResolved();
        
        // Prevent duplicate requests (unless timeout)
        if (drawRequestedAt != 0 && block.timestamp < drawRequestedAt + 1 days) {
            revert DrawAlreadyRequested();
        }
        
        // Generate Encrypted Random Number
        euint64 random = TFHE.randEuint64();
        TFHE.allow(random, address(this));
        
        uint256[] memory cts = new uint256[](1);
        cts[0] = euint64.unwrap(random);
        
        // Request Decryption
        requestDecryption(cts, this.callback.selector);
        
        drawRequestedAt = block.timestamp;
        emit DrawRequested(block.timestamp);
    }

    modifier onlyGateway() {
        if (msg.sender != gatewayContractAddress()) revert Unauthorized();
        _;
    }

    /**
     * @notice Callback from Gateway
     */
    function callback(uint256 requestID, uint256[] memory decryptedOutputs, bytes[] memory signatures) public onlyGateway checkSignatures(requestID, signatures) returns (uint256[] memory) {
        if (isResolved) return decryptedOutputs; // Already resolved
        
        // Simple modulo for winning number
        // Note: In production, ensure modulo bias is handled if range is not power of 2
        // For 0-99 or 0-999, bias is negligible for uint64
        uint256 randomVal = decryptedOutputs[0];
        winningNumber = randomVal % (maxNumber + 1);
        
        isResolved = true;
        emit RoundResolved(winningNumber);
        
        return decryptedOutputs;
    }

    /**
     * @notice Claim winnings
     */
    function claimWinnings() external nonReentrant {
        if (!isResolved) revert RoundNotEnded();
        
        uint256 totalPayout = 0;
        uint256[] memory indices = userBetIndices[msg.sender];
        
        for (uint256 i = 0; i < indices.length; i++) {
            Bet storage bet = bets[indices[i]];
            if (!bet.claimed && bet.number == winningNumber) {
                bet.claimed = true;
                totalPayout += bet.potentialPayout;
            }
        }
        
        if (totalPayout == 0) revert NothingToClaim();
        
        // Update liability tracking
        totalUnclaimedPayouts -= totalPayout;
        
        (bool sent, ) = payable(msg.sender).call{value: totalPayout}("");
        if (!sent) revert TransferFailed();
        
        emit WinningsClaimed(msg.sender, totalPayout);
    }
    
    /**
     * @notice Owner can withdraw remaining collateral after resolution
     */
    function withdrawCollateral() external onlyOwner {
        if (!isResolved) revert RoundNotEnded();
        
        uint256 balance = address(this).balance;
        // Ensure we keep enough for unclaimed winners
        if (balance <= totalUnclaimedPayouts) revert NothingToClaim();
        
        uint256 available = balance - totalUnclaimedPayouts;
        
        (bool sent, ) = payable(owner).call{value: available}("");
        require(sent, "Withdraw failed");
        
        emit CollateralWithdrawn(owner, available);
    }
    
    // View functions for frontend
    function getBetCount() external view returns (uint256) {
        return bets.length;
    }
    
    function getUserBets(address user) external view returns (Bet[] memory) {
        uint256[] memory indices = userBetIndices[user];
        Bet[] memory userBets = new Bet[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            userBets[i] = bets[indices[i]];
        }
        
        return userBets;
    }
}
