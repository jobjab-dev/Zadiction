// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ZadictionLottery.sol";

/**
 * @title LotteryFactory
 * @notice Factory contract for deploying lottery rounds
 */
contract LotteryFactory {
    address public owner;
    address[] public allMarkets;
    mapping(address => uint256) public marketCreatedAt;
    
    // Protocol Fee (in basis points, e.g., 25 = 0.25%)
    uint256 public protocolFeeBasisPoints = 25; // Default 0.25%
    address public protocolTreasury;

    event MarketCreated(address indexed marketAddress, address indexed creator, uint256 roundId);
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event ProtocolTreasuryUpdated(address oldTreasury, address newTreasury);

    error Unauthorized();
    error InvalidFee();
    error InvalidOdds();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
        protocolTreasury = msg.sender; // Default to owner
    }

    /**
     * @notice Create a new lottery market
     * @dev Initial odds must be >= fair odds (e.g., 100x for 2 digits)
     */
    function createMarket(
        uint8 _digits,
        uint256 _betPeriod,
        uint256 _initialOdds,
        uint256 _minOdds,
        uint256 _creatorFeePercent
    ) external payable returns (address marketAddress) {
        // Validate fair odds
        uint256 fairOdds = _calculateFairOdds(_digits);
        if (_initialOdds < fairOdds) revert InvalidOdds();
        
        // Validate fees (max 10% total)
        if (_creatorFeePercent > 1000) revert InvalidFee(); // Max 10%
        
        uint256 roundId = allMarkets.length + 1;
        
        ZadictionLottery market = new ZadictionLottery{value: msg.value}(
            msg.sender,      // Market creator (treasury for creator fee)
            roundId,
            _digits,
            _betPeriod,
            _initialOdds,
            _minOdds,
            _creatorFeePercent,
            protocolFeeBasisPoints,
            protocolTreasury
        );

        marketAddress = address(market);
        allMarkets.push(marketAddress);
        marketCreatedAt[marketAddress] = block.timestamp;

        emit MarketCreated(marketAddress, msg.sender, roundId);
    }

    /**
     * @notice Calculate fair odds for given number of digits
     * @dev 2 digits = 100x, 3 digits = 1000x, etc.
     */
    function _calculateFairOdds(uint8 digits) internal pure returns (uint256) {
        uint256 possibleNumbers = 10 ** digits;
        return possibleNumbers * 100; // Return in basis points (e.g., 10000 = 100x)
    }

    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    function getMarketInfo(address _market) external view returns (
        address marketAddress,
        uint256 roundId,
        uint8 digits,
        uint256 collateral,
        uint256 betDeadline,
        uint256 createdAt,
        bool isActive,
        bool isResolved
    ) {
        ZadictionLottery market = ZadictionLottery(_market);
        
        marketAddress = _market;
        roundId = market.roundId();
        digits = market.digits();
        collateral = market.collateral();
        betDeadline = market.betDeadline();
        createdAt = marketCreatedAt[_market];
        isActive = block.timestamp < market.betDeadline();
        isResolved = market.isResolved();
    }

    /**
     * @notice Update protocol fee (only owner)
     * @param _newFeeBasisPoints New fee in basis points (e.g., 25 = 0.25%)
     */
    function setProtocolFee(uint256 _newFeeBasisPoints) external onlyOwner {
        if (_newFeeBasisPoints > 500) revert InvalidFee(); // Max 5%
        uint256 oldFee = protocolFeeBasisPoints;
        protocolFeeBasisPoints = _newFeeBasisPoints;
        emit ProtocolFeeUpdated(oldFee, _newFeeBasisPoints);
    }

    /**
     * @notice Update protocol treasury address (only owner)
     */
    function setProtocolTreasury(address _newTreasury) external onlyOwner {
        address oldTreasury = protocolTreasury;
        protocolTreasury = _newTreasury;
        emit ProtocolTreasuryUpdated(oldTreasury, _newTreasury);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
