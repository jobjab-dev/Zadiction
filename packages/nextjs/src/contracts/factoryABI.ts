export const FACTORY_ABI = [
  "function createMarket(uint8 _digits, uint256 _betPeriod, uint256 _initialOdds, uint256 _minOdds, uint256 _creatorFeePercent) external payable returns (address)",
  "function getAllMarkets() external view returns (address[])",
  "function getMarketInfo(address _market) external view returns (address, uint256, uint8, uint256, uint256, uint256, bool, bool)",
  "event MarketCreated(address indexed marketAddress, address indexed owner, uint256 roundId)"
];

export const MARKET_ABI = [
  // View Functions
  "function creator() external view returns (address)",
  "function owner() external view returns (address)",
  "function roundId() external view returns (uint256)",
  "function digits() external view returns (uint8)",
  "function maxNumber() external view returns (uint256)",
  "function betDeadline() external view returns (uint256)",
  "function collateral() external view returns (uint256)",
  "function liabilityLimit() external view returns (uint256)",
  "function initialOdds() external view returns (uint256)",
  "function minOdds() external view returns (uint256)",
  "function feePercent() external view returns (uint256)",
  "function exposure(uint256) external view returns (uint256)",
  "function totalStakes(uint256) external view returns (uint256)",
  "function isResolved() external view returns (bool)",
  "function winningNumber() external view returns (uint256)",
  "function totalUnclaimedPayouts() external view returns (uint256)",
  "function drawRequestedAt() external view returns (uint256)",
  "function getBetCount() external view returns (uint256)",
  "function bets(uint256) external view returns (address player, uint256 number, uint256 amount, uint256 lockedOdds, uint256 potentialPayout, bool claimed)",
  "function getOdds(uint256 number, uint256 amount) external view returns (uint256)",
  "function maxBet(uint256 number) external view returns (uint256)",
  "function getUserBets(address user) external view returns (tuple(address player, uint256 number, uint256 amount, uint256 lockedOdds, uint256 potentialPayout, bool claimed)[])",

  // Write Functions
  "function placeBet(uint256 number) external payable",
  "function drawResult() external",
  "function claimWinnings() external",
  "function withdrawCollateral() external",

  // Events
  "event BetPlaced(address indexed player, uint256 number, uint256 amount, uint256 odds, uint256 potentialPayout)",
  "event DrawRequested(uint256 timestamp)",
  "event RoundResolved(uint256 winningNumber)",
  "event WinningsClaimed(address indexed player, uint256 amount)",
  "event CollateralWithdrawn(address indexed owner, uint256 amount)"
];
