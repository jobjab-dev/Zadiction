export const FACTORY_ABI = [
  "function owner() view returns (address)",
  "function createMarket(string,uint256,uint256,uint256,address,uint256) returns (address)",
  "function getAllMarkets() view returns (address[])",
  "function getActiveMarkets() view returns (address[])",
  "function getMarketCount() view returns (uint256)",
  "function getMarketInfo(address) view returns (tuple(address marketAddress, string question, uint256 stakeAmount, uint256 commitDeadline, uint256 resolveDeadline, address resolver, uint256 createdAt, bool isActive))",
  "function getMarketsInfo(uint256,uint256) view returns (tuple(address,string,uint256,uint256,uint256,address,uint256,bool)[])",
  "function transferOwnership(address) external",
  "function deactivateMarket(address) external",
  "event MarketCreated(address indexed marketAddress, string question, uint256 stakeAmount, uint256 commitDeadline, uint256 resolveDeadline, address indexed resolver, uint256 indexed marketId)"
] as const;

export const MARKET_ABI = [
  "function getMarketInfo() external view returns (string, uint256, uint256, uint256, uint8, uint256, uint256, bool, bool, uint256)",
  "function getParticipantInfo(address) external view returns (bool, bool, bool)",
  "function submitPrediction(bytes, bytes) external payable",
  "function computeWinnerFlag(address) external view returns (bytes)",
  "function getMyWinnerFlag() external view returns (bytes)",
  "function claimWinnerStatus(bool) external",
  "function withdraw() external",
  "function refund() external",
  "function lockMarket() external",
  "function resolveOutcome(bool) external",
  "function getPotentialPayout() external view returns (uint256)",
  "function stakeAmount() external view returns (uint256)",
  "function question() external view returns (string)",
  "function currentPhase() external view returns (uint8)",
  "function isResolved() external view returns (bool)",
  "function outcome() external view returns (bool)",
  "function winnerCount() external view returns (uint256)",
  "function totalStaked() external view returns (uint256)",
  "function participantCount() external view returns (uint256)",
  "function resolver() external view returns (address)",
  "event PredictionSubmitted(address indexed participant, uint256 timestamp)",
  "event OutcomeResolved(bool outcome, uint256 timestamp)",
  "event WinnerComputed(address indexed participant, bool isWinner)",
  "event RewardWithdrawn(address indexed participant, uint256 amount)"
] as const;

