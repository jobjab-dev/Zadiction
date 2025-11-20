// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "./ConfidentialPredictionMarket.sol";

/**
 * @title Prediction Market Factory
 * @notice Factory contract to create and manage multiple prediction markets
 * @dev Only owner can create markets, but anyone can participate
 * 
 * Features:
 * - Create multiple markets without redeploying
 * - Track all created markets
 * - Owner-only market creation
 * - Easy frontend integration
 * 
 * Built for Zama Developer Program - November 2024
 */
contract PredictionMarketFactory {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    address public owner;
    address[] public markets;
    
    // Mapping for quick lookup
    mapping(address => bool) public isMarket;
    
    // Market metadata for frontend
    struct MarketInfo {
        address marketAddress;
        string question;
        uint256 stakeAmount;
        uint256 commitDeadline;
        uint256 resolveDeadline;
        address resolver;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(address => MarketInfo) public marketInfo;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event MarketCreated(
        address indexed marketAddress,
        string question,
        uint256 stakeAmount,
        uint256 commitDeadline,
        uint256 resolveDeadline,
        address indexed resolver,
        uint256 indexed marketId
    );
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error Unauthorized();
    error InvalidAddress();
    error InvalidParameters();

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                          MARKET CREATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new prediction market
     * @dev Only owner can create markets
     * 
     * @param _question The prediction question
     * @param _stakeAmount Amount each participant must stake (in wei)
     * @param _commitPeriod Duration for accepting predictions (in seconds)
     * @param _resolvePeriod Duration for resolving outcome (in seconds)
     * @param _resolver Address authorized to resolve the market
     * @param _creatorFeePercent Fee percentage in basis points (max 500 = 5%)
     * @return marketAddress Address of the newly created market
     */
    function createMarket(
        string memory _question,
        uint256 _stakeAmount,
        uint256 _commitPeriod,
        uint256 _resolvePeriod,
        address _resolver,
        uint256 _creatorFeePercent
    ) external onlyOwner returns (address marketAddress) {
        // Validation
        if (_stakeAmount == 0) revert InvalidParameters();
        if (_commitPeriod == 0 || _resolvePeriod == 0) revert InvalidParameters();
        if (_resolver == address(0)) revert InvalidAddress();
        if (_creatorFeePercent > 500) revert InvalidParameters();

        // Deploy new market contract
        ConfidentialPredictionMarket market = new ConfidentialPredictionMarket(
            _question,
            _stakeAmount,
            _commitPeriod,
            _resolvePeriod,
            _resolver,
            _creatorFeePercent
        );

        marketAddress = address(market);
        
        // Store market
        markets.push(marketAddress);
        isMarket[marketAddress] = true;
        
        // Store metadata
        marketInfo[marketAddress] = MarketInfo({
            marketAddress: marketAddress,
            question: _question,
            stakeAmount: _stakeAmount,
            commitDeadline: block.timestamp + _commitPeriod,
            resolveDeadline: block.timestamp + _commitPeriod + _resolvePeriod,
            resolver: _resolver,
            createdAt: block.timestamp,
            isActive: true
        });

        emit MarketCreated(
            marketAddress,
            _question,
            _stakeAmount,
            block.timestamp + _commitPeriod,
            block.timestamp + _commitPeriod + _resolvePeriod,
            _resolver,
            markets.length - 1
        );

        return marketAddress;
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get total number of markets created
     */
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }

    /**
     * @notice Get market address by index
     * @param index Index in the markets array
     */
    function getMarket(uint256 index) external view returns (address) {
        require(index < markets.length, "Index out of bounds");
        return markets[index];
    }

    /**
     * @notice Get all market addresses
     */
    function getAllMarkets() external view returns (address[] memory) {
        return markets;
    }

    /**
     * @notice Get active markets (commit deadline not passed)
     */
    function getActiveMarkets() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active markets
        for (uint256 i = 0; i < markets.length; i++) {
            if (marketInfo[markets[i]].commitDeadline > block.timestamp) {
                activeCount++;
            }
        }
        
        // Create array of active markets
        address[] memory activeMarkets = new address[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < markets.length; i++) {
            if (marketInfo[markets[i]].commitDeadline > block.timestamp) {
                activeMarkets[currentIndex] = markets[i];
                currentIndex++;
            }
        }
        
        return activeMarkets;
    }

    /**
     * @notice Get market metadata
     * @param marketAddress Address of the market
     */
    function getMarketInfo(address marketAddress) external view returns (MarketInfo memory) {
        require(isMarket[marketAddress], "Not a valid market");
        return marketInfo[marketAddress];
    }

    /**
     * @notice Get multiple markets info (for pagination)
     * @param startIndex Starting index
     * @param count Number of markets to fetch
     */
    function getMarketsInfo(uint256 startIndex, uint256 count) 
        external 
        view 
        returns (MarketInfo[] memory) 
    {
        if (startIndex >= markets.length) {
            return new MarketInfo[](0);
        }
        
        uint256 endIndex = startIndex + count;
        if (endIndex > markets.length) {
            endIndex = markets.length;
        }
        
        uint256 resultCount = endIndex - startIndex;
        MarketInfo[] memory result = new MarketInfo[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = marketInfo[markets[startIndex + i]];
        }
        
        return result;
    }

    /*//////////////////////////////////////////////////////////////
                          OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Transfer ownership to a new owner
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        
        address oldOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @notice Mark a market as inactive (for frontend filtering)
     * @param marketAddress Address of the market to deactivate
     */
    function deactivateMarket(address marketAddress) external onlyOwner {
        require(isMarket[marketAddress], "Not a valid market");
        marketInfo[marketAddress].isActive = false;
    }
}

