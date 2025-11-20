// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/**
 * @title Confidential Prediction Market
 * @notice A single-question, fixed-stake prediction market with encrypted predictions
 * @dev Uses FHEVM v0.9 for confidential predictions using ebool
 * 
 * Key Features:
 * - Encrypted predictions (ebool) - nobody can see your choice until resolution
 * - Fixed stake amount - fair participation for everyone
 * - Manual resolution - trusted resolver declares outcome
 * - ACL-controlled decryption - programmable privacy
 * 
 * Built for Zama Developer Program - November 2024
 */
contract ConfidentialPredictionMarket is SepoliaZamaFHEVMConfig {
    /*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/

    enum Phase {
        Commit,    // Users can submit encrypted predictions
        Locked,    // Waiting for outcome
        Resolved   // Outcome declared, winners can withdraw
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    // Market configuration
    string public question;
    uint256 public stakeAmount;
    uint256 public commitDeadline;
    uint256 public resolveDeadline;
    address public resolver;
    address public creator;
    
    // Market state
    Phase public currentPhase;
    bool public outcome; // true = YES wins, false = NO wins
    bool public isResolved;
    
    // Encrypted predictions (THE CORE FHE FEATURE!)
    mapping(address => ebool) private predictions;
    mapping(address => bool) public hasPredicted;
    
    // Payout tracking
    uint256 public totalStaked;
    uint256 public participantCount;
    uint256 public winnerCount;
    mapping(address => bool) public canWithdraw;
    mapping(address => bool) public hasWithdrawn;
    
    // Fee configuration (optional for creator)
    uint256 public creatorFeePercent; // in basis points (1% = 100)
    uint256 public accumulatedFees;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event MarketCreated(
        string question,
        uint256 stakeAmount,
        uint256 commitDeadline,
        uint256 resolveDeadline,
        address indexed resolver
    );
    
    event PredictionSubmitted(address indexed participant, uint256 timestamp);
    event MarketLocked(uint256 timestamp);
    event OutcomeResolved(bool outcome, uint256 timestamp);
    event WinnerComputed(address indexed participant, bool isWinner);
    event RewardWithdrawn(address indexed participant, uint256 amount);
    event RefundIssued(address indexed participant, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidPhase();
    error DeadlinePassed();
    error DeadlineNotReached();
    error AlreadyPredicted();
    error IncorrectStakeAmount();
    error UnauthorizedResolver();
    error NotWinner();
    error AlreadyWithdrawn();
    error TransferFailed();
    error MarketNotResolved();
    error InvalidConfiguration();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new confidential prediction market
     * @param _question The question to predict on
     * @param _stakeAmount Fixed ETH amount each participant must stake
     * @param _commitPeriod How long users can submit predictions (in seconds)
     * @param _resolvePeriod How long resolver has to declare outcome (in seconds)
     * @param _resolver Address authorized to resolve outcome
     * @param _creatorFeePercent Fee percentage for creator (in basis points, max 500 = 5%)
     */
    constructor(
        string memory _question,
        uint256 _stakeAmount,
        uint256 _commitPeriod,
        uint256 _resolvePeriod,
        address _resolver,
        uint256 _creatorFeePercent
    ) {
        if (_stakeAmount == 0) revert InvalidConfiguration();
        if (_commitPeriod == 0 || _resolvePeriod == 0) revert InvalidConfiguration();
        if (_resolver == address(0)) revert InvalidConfiguration();
        if (_creatorFeePercent > 500) revert InvalidConfiguration(); // Max 5% fee

        question = _question;
        stakeAmount = _stakeAmount;
        commitDeadline = block.timestamp + _commitPeriod;
        resolveDeadline = commitDeadline + _resolvePeriod;
        resolver = _resolver;
        creator = msg.sender;
        creatorFeePercent = _creatorFeePercent;
        currentPhase = Phase.Commit;

        emit MarketCreated(
            _question,
            _stakeAmount,
            commitDeadline,
            resolveDeadline,
            _resolver
        );
    }

    /*//////////////////////////////////////////////////////////////
                          PHASE 1: COMMIT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Submit an encrypted prediction
     * @dev THIS IS THE CORE FHE FUNCTIONALITY!
     *      - Client encrypts their YES/NO choice as ebool
     *      - Contract stores encrypted prediction
     *      - Nobody can see individual predictions
     *      - ACL allows contract to use for winner computation
     * 
     * @param encryptedPrediction External encrypted bool (YES=true, NO=false)
     * @param inputProof ZK proof that encryption is valid
     */
    function submitPrediction(
        einput encryptedPrediction,
        bytes calldata inputProof
    ) external payable {
        // Validations
        if (currentPhase != Phase.Commit) revert InvalidPhase();
        if (block.timestamp >= commitDeadline) revert DeadlinePassed();
        if (hasPredicted[msg.sender]) revert AlreadyPredicted();
        if (msg.value != stakeAmount) revert IncorrectStakeAmount();

        // Convert external encrypted input to internal ebool
        // This is the FHEVM v0.9 pattern: einput + proof → ebool
        ebool prediction = TFHE.asEbool(encryptedPrediction, inputProof);

        // Store encrypted prediction
        predictions[msg.sender] = prediction;
        hasPredicted[msg.sender] = true;

        // Set ACL: allow this contract to use the encrypted value later
        // This is CRITICAL for computing winners in Phase 3
        TFHE.allowThis(prediction);
        
        // Also allow the user to view their own prediction if needed
        TFHE.allow(prediction, msg.sender);

        // Update market state
        totalStaked += msg.value;
        participantCount++;

        emit PredictionSubmitted(msg.sender, block.timestamp);
    }

    /**
     * @notice Check if user has submitted prediction
     * @param user Address to check
     * @return bool Whether user has predicted
     */
    function checkHasPredicted(address user) external view returns (bool) {
        return hasPredicted[user];
    }

    /*//////////////////////////////////////////////////////////////
                          PHASE 2: LOCK
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Lock the market after commit deadline passes
     * @dev Can be called by anyone, just changes phase
     */
    function lockMarket() external {
        if (block.timestamp < commitDeadline) revert DeadlineNotReached();
        if (currentPhase != Phase.Commit) revert InvalidPhase();
        
        currentPhase = Phase.Locked;
        emit MarketLocked(block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                      PHASE 3: RESOLVE & COMPUTE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Resolver declares the outcome
     * @dev This is the "manual oracle" - no complex price feed needed for MVP
     *      The resolver (multisig/trusted address) declares true outcome
     *      Trust model: outcome is publicly verifiable fact
     * 
     * @param _outcome true = YES wins, false = NO wins
     */
    function resolveOutcome(bool _outcome) external {
        if (msg.sender != resolver) revert UnauthorizedResolver();
        if (currentPhase != Phase.Locked) {
            // Auto-lock if deadline passed
            if (block.timestamp >= commitDeadline && currentPhase == Phase.Commit) {
                currentPhase = Phase.Locked;
                emit MarketLocked(block.timestamp);
            } else {
                revert InvalidPhase();
            }
        }
        if (block.timestamp > resolveDeadline) revert DeadlinePassed();
        if (isResolved) revert InvalidPhase();

        outcome = _outcome;
        isResolved = true;
        currentPhase = Phase.Resolved;

        // Calculate creator fee
        if (creatorFeePercent > 0) {
            accumulatedFees = (totalStaked * creatorFeePercent) / 10000;
        }

        emit OutcomeResolved(_outcome, block.timestamp);
    }

    /**
     * @notice Compute encrypted winner flag for a participant
     * @dev THIS IS WHERE THE FHE MAGIC HAPPENS!
     *      - Takes encrypted prediction (ebool)
     *      - Compares with plain outcome using FHE operations
     *      - Returns encrypted "is winner" flag
     *      - User decrypts off-chain via SDK
     * 
     * This demonstrates programmable confidentiality:
     * - Predictions stay encrypted
     * - Compute "did user win?" via FHE
     * - User decrypts result themselves using SDK
     * 
     * @param participant Address to compute winner status for
     * @return Encrypted winner flag (ebool)
     */
    function computeWinnerFlag(address participant) external returns (ebool) {
        if (!isResolved) revert MarketNotResolved();
        if (!hasPredicted[participant]) revert InvalidPhase();

        // Get participant's encrypted prediction
        ebool encryptedPrediction = predictions[participant];

        // FHE OPERATION: Compare encrypted prediction with plain outcome
        // If outcome is true (YES wins):
        //   - isWinner = encryptedPrediction (those who picked YES win)
        // If outcome is false (NO wins):
        //   - isWinner = NOT(encryptedPrediction) (those who picked NO win)
        
        ebool isWinnerEncrypted;
        if (outcome) {
            // YES wins: winner if prediction == true
            isWinnerEncrypted = encryptedPrediction;
        } else {
            // NO wins: winner if prediction == false
            isWinnerEncrypted = TFHE.not(encryptedPrediction);
        }

        // Allow participant to decrypt their winner status
        TFHE.allow(isWinnerEncrypted, participant);
        TFHE.allow(isWinnerEncrypted, address(this));

        return isWinnerEncrypted;
    }

    /**
     * @notice Mark yourself as winner after decrypting result
     * @dev User decrypts computeWinnerFlag() off-chain, then calls this if they won
     * @param isWinner Result from decrypting computeWinnerFlag()
     */
    function claimWinnerStatus(bool isWinner) external {
        if (!isResolved) revert MarketNotResolved();
        if (!hasPredicted[msg.sender]) revert InvalidPhase();
        if (canWithdraw[msg.sender]) return; // Already claimed

        if (isWinner) {
            canWithdraw[msg.sender] = true;
            winnerCount++;
            emit WinnerComputed(msg.sender, true);
        } else {
            emit WinnerComputed(msg.sender, false);
        }
    }

    /**
     * @notice Helper to get your encrypted winner flag
     * @dev Convenience function - same as computeWinnerFlag(msg.sender)
     * @return Encrypted winner flag that you can decrypt
     */
    function getMyWinnerFlag() external returns (ebool) {
        return this.computeWinnerFlag(msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                        PHASE 4: WITHDRAW
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Withdraw winnings
     * @dev Winners split the pot (minus creator fee)
     */
    function withdraw() external {
        if (!isResolved) revert MarketNotResolved();
        if (!canWithdraw[msg.sender]) revert NotWinner();
        if (hasWithdrawn[msg.sender]) revert AlreadyWithdrawn();

        hasWithdrawn[msg.sender] = true;

        // Calculate payout: (total - fees) / winnerCount
        uint256 poolAfterFees = totalStaked - accumulatedFees;
        uint256 payout = winnerCount > 0 ? poolAfterFees / winnerCount : 0;

        if (payout > 0) {
            (bool success, ) = msg.sender.call{value: payout}("");
            if (!success) revert TransferFailed();
            
            emit RewardWithdrawn(msg.sender, payout);
        }
    }

    /**
     * @notice Emergency refund if no winners or market fails
     * @dev Can be called if resolution deadline passed without resolution
     */
    function refund() external {
        // Allow refunds if deadline passed and not resolved
        bool refundAllowed = block.timestamp > resolveDeadline && !isResolved;
        
        if (!refundAllowed) revert InvalidPhase();
        if (!hasPredicted[msg.sender]) revert NotWinner();
        if (hasWithdrawn[msg.sender]) revert AlreadyWithdrawn();

        hasWithdrawn[msg.sender] = true;

        (bool success, ) = msg.sender.call{value: stakeAmount}("");
        if (!success) revert TransferFailed();

        emit RefundIssued(msg.sender, stakeAmount);
    }

    /**
     * @notice Creator withdraws accumulated fees
     */
    function withdrawFees() external {
        if (msg.sender != creator) revert UnauthorizedResolver();
        if (!isResolved) revert MarketNotResolved();
        if (accumulatedFees == 0) return;

        uint256 fees = accumulatedFees;
        accumulatedFees = 0;

        (bool success, ) = creator.call{value: fees}("");
        if (!success) revert TransferFailed();
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get market info
     */
    function getMarketInfo() external view returns (
        string memory _question,
        uint256 _stakeAmount,
        uint256 _commitDeadline,
        uint256 _resolveDeadline,
        Phase _phase,
        uint256 _totalStaked,
        uint256 _participantCount,
        bool _isResolved,
        bool _outcome,
        uint256 _winnerCount
    ) {
        return (
            question,
            stakeAmount,
            commitDeadline,
            resolveDeadline,
            currentPhase,
            totalStaked,
            participantCount,
            isResolved,
            outcome,
            winnerCount
        );
    }

    /**
     * @notice Get participant info
     */
    function getParticipantInfo(address participant) external view returns (
        bool _hasPredicted,
        bool _canWithdraw,
        bool _hasWithdrawn
    ) {
        return (
            hasPredicted[participant],
            canWithdraw[participant],
            hasWithdrawn[participant]
        );
    }

    /**
     * @notice Calculate potential payout
     */
    function getPotentialPayout() external view returns (uint256) {
        if (!isResolved || winnerCount == 0) return 0;
        uint256 poolAfterFees = totalStaked - accumulatedFees;
        return poolAfterFees / winnerCount;
    }

    /**
     * @notice Get user's encrypted prediction handle (for decryption)
     * @dev User can decrypt their own prediction if needed
     * @param user Address to query
     * @return Encrypted prediction handle
     */
    function getEncryptedPrediction(address user) external view returns (ebool) {
        if (!hasPredicted[user]) revert InvalidPhase();
        return predictions[user];
    }
}

