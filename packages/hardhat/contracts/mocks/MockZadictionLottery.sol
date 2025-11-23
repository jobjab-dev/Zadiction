// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "../ZadictionLottery.sol";

contract MockZadictionLottery is ZadictionLottery {
    constructor(
        address _owner,
        uint256 _roundId,
        uint8 _digits,
        uint256 _betPeriod,
        uint256 _initialOdds,
        uint256 _minOdds,
        uint256 _creatorFeePercent,
        uint256 _protocolFeePercent,
        address _protocolTreasury
    ) payable ZadictionLottery(
        _owner,
        _roundId,
        _digits,
        _betPeriod,
        _initialOdds,
        _minOdds,
        _creatorFeePercent,
        _protocolFeePercent,
        _protocolTreasury
    ) {}

    function forceResolve(uint256 _winningNumber) external {
        winningNumber = _winningNumber;
        isResolved = true;
        emit RoundResolved(_winningNumber);
    }
}
