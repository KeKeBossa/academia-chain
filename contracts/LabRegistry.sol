// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';

/// @title LabRegistry
/// @notice Keeps track of DAO labs, their metadata, and administrative roles.
contract LabRegistry is AccessControl {
  bytes32 public constant LAB_ADMIN_ROLE = keccak256('LAB_ADMIN_ROLE');

  struct Lab {
    string name;
    address dao;
    string metadataCid;
  }

  mapping(uint256 => Lab) private _labs;
  uint256 private _labCount;

  event LabRegistered(
    uint256 indexed labId,
    address indexed dao,
    address indexed admin,
    string name,
    string metadataCid
  );
  event LabMetadataUpdated(uint256 indexed labId, string metadataCid);

  constructor(address superAdmin) {
    _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
  }

  function labCount() external view returns (uint256) {
    return _labCount;
  }

  function getLab(uint256 labId) external view returns (Lab memory) {
    require(labId < _labCount, 'LabRegistry: lab not found');
    return _labs[labId];
  }

  function registerLab(
    string calldata name,
    address dao,
    string calldata metadataCid,
    address admin
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 labId) {
    require(bytes(name).length > 0, 'LabRegistry: name required');
    require(dao != address(0), 'LabRegistry: dao required');
    require(admin != address(0), 'LabRegistry: admin required');

    labId = _labCount;
    _labCount += 1;

    _labs[labId] = Lab({name: name, dao: dao, metadataCid: metadataCid});
    _grantRole(LAB_ADMIN_ROLE, admin);
    emit LabRegistered(labId, dao, admin, name, metadataCid);
  }

  function updateMetadata(
    uint256 labId,
    string calldata metadataCid
  ) external onlyRole(LAB_ADMIN_ROLE) {
    require(labId < _labCount, 'LabRegistry: lab not found');
    _labs[labId].metadataCid = metadataCid;
    emit LabMetadataUpdated(labId, metadataCid);
  }
}
