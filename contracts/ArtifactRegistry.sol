// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';

/// @title ArtifactRegistry
/// @notice Records IPFS CIDs of research assets and links them to DAO proposals.
contract ArtifactRegistry is AccessControl {
  bytes32 public constant REGISTRAR_ROLE = keccak256('REGISTRAR_ROLE');

  struct Artifact {
    uint256 labId;
    string cid;
    bytes32 artifactHash;
    uint256 proposalId;
    address creator;
    uint256 createdAt;
  }

  Artifact[] private _artifacts;

  event ArtifactRegistered(
    uint256 indexed artifactId,
    uint256 indexed labId,
    string cid,
    bytes32 artifactHash,
    uint256 proposalId,
    address indexed creator
  );

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(REGISTRAR_ROLE, admin);
  }

  function artifactCount() external view returns (uint256) {
    return _artifacts.length;
  }

  function getArtifact(uint256 artifactId) external view returns (Artifact memory) {
    require(artifactId < _artifacts.length, 'ArtifactRegistry: invalid id');
    return _artifacts[artifactId];
  }

  function registerArtifact(
    uint256 labId,
    string calldata cid,
    bytes32 artifactHash,
    uint256 proposalId
  ) external onlyRole(REGISTRAR_ROLE) returns (uint256 artifactId) {
    require(bytes(cid).length > 0, 'ArtifactRegistry: cid required');
    artifactId = _artifacts.length;
    _artifacts.push(
      Artifact({
        labId: labId,
        cid: cid,
        artifactHash: artifactHash,
        proposalId: proposalId,
        creator: msg.sender,
        createdAt: block.timestamp
      })
    );
    emit ArtifactRegistered(artifactId, labId, cid, artifactHash, proposalId, msg.sender);
  }
}
