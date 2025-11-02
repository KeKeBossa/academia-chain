// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {ERC20Permit} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol';
import {ERC20Votes} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';
import {Nonces} from '@openzeppelin/contracts/utils/Nonces.sol';

/// @title LabGovernorToken
/// @notice ERC20Votes token that represents DAO voting power with role-based minting.
contract LabGovernorToken is AccessControl, ERC20Permit, ERC20Votes {
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  constructor(
    address admin
  ) ERC20('Academic Lab Governance Token', 'ALGT') ERC20Permit('Academic Lab Governance Token') {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(MINTER_ROLE, admin);
  }

  function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
    _mint(to, amount);
  }

  function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) {
    _burn(from, amount);
  }

  // Overrides required by Solidity for ERC20Votes

  function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
    super._update(from, to, value);
  }

  function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
    return super.nonces(owner);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(AccessControl) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
