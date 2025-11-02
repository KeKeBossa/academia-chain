// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';

/// @title CredentialAnchor
/// @notice Anchors hashed Verifiable Credentials for DID based verification.
contract CredentialAnchor is AccessControl {
  bytes32 public constant REGISTRAR_ROLE = keccak256('REGISTRAR_ROLE');

  struct CredentialRecord {
    bytes32 credentialHash;
    uint256 labId;
    bool revoked;
    uint256 issuedAt;
  }

  mapping(address => CredentialRecord) private _records;

  event CredentialRecorded(address indexed subject, uint256 indexed labId, bytes32 credentialHash);
  event CredentialRevoked(address indexed subject, uint256 indexed labId);

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(REGISTRAR_ROLE, admin);
  }

  function getCredential(address subject) external view returns (CredentialRecord memory) {
    return _records[subject];
  }

  function recordCredential(
    address subject,
    uint256 labId,
    bytes32 credentialHash
  ) external onlyRole(REGISTRAR_ROLE) {
    require(subject != address(0), 'CredentialAnchor: subject required');
    _records[subject] = CredentialRecord({
      credentialHash: credentialHash,
      labId: labId,
      revoked: false,
      issuedAt: block.timestamp
    });
    emit CredentialRecorded(subject, labId, credentialHash);
  }

  function revokeCredential(address subject) external onlyRole(REGISTRAR_ROLE) {
    CredentialRecord storage record = _records[subject];
    require(record.issuedAt != 0, 'CredentialAnchor: credential missing');
    record.revoked = true;
    emit CredentialRevoked(subject, record.labId);
  }
}
