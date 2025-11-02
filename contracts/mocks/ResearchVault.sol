// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title ResearchVault
/// @notice Simple storage contract used to validate governor proposal execution.
contract ResearchVault {
  address public immutable timelock;
  uint256 private _value;
  address private _lastUpdatedBy;

  event ValueUpdated(uint256 newValue, address indexed updater);

  constructor(address timelock_) {
    timelock = timelock_;
  }

  function value() external view returns (uint256) {
    return _value;
  }

  function lastUpdatedBy() external view returns (address) {
    return _lastUpdatedBy;
  }

  function setValue(uint256 newValue) external {
    require(msg.sender == timelock, 'ResearchVault: only timelock can update value');
    _value = newValue;
    _lastUpdatedBy = msg.sender;
    emit ValueUpdated(newValue, msg.sender);
  }
}
