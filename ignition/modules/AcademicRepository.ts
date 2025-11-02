import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const AcademicRepositoryModule = buildModule('AcademicRepositoryModule', (m) => {
  const admin = m.getAccount(0);

  const registry = m.contract('LabRegistry', [admin]);
  const governanceToken = m.contract('LabGovernorToken', [admin]);

  const timelockDelay = m.getParameter('timelockDelaySeconds', 3600);
  const timelock = m.contract('TimelockController', [timelockDelay, [], [], admin]);

  const votingDelay = m.getParameter('votingDelayBlocks', 1);
  const votingPeriod = m.getParameter('votingPeriodBlocks', 45818);
  const proposalThreshold = 10n * 10n ** 18n; // 10 tokens
  const quorumFraction = m.getParameter('quorumFractionPercent', 10);

  const dao = m.contract('LabDAO', [
    governanceToken,
    timelock,
    votingDelay,
    votingPeriod,
    proposalThreshold,
    quorumFraction
  ]);

  const artifactRegistry = m.contract('ArtifactRegistry', [admin]);
  const credentialAnchor = m.contract('CredentialAnchor', [admin]);

  const proposerRole = m.staticCall(timelock, 'PROPOSER_ROLE', []);
  const executorRole = m.staticCall(timelock, 'EXECUTOR_ROLE', []);
  const adminRole = m.staticCall(timelock, 'DEFAULT_ADMIN_ROLE', []);
  const minterRole = m.staticCall(governanceToken, 'MINTER_ROLE', []);

  m.call(timelock, 'grantRole', [proposerRole, dao], { id: 'TimelockGrantProposer' });
  m.call(timelock, 'grantRole', [executorRole, '0x0000000000000000000000000000000000000000'], {
    id: 'TimelockGrantExecutor'
  });
  m.call(timelock, 'revokeRole', [adminRole, admin], { id: 'TimelockRevokeAdmin' });
  m.call(governanceToken, 'grantRole', [minterRole, timelock], {
    id: 'TokenGrantMinterToTimelock'
  });

  return { registry, governanceToken, timelock, dao, artifactRegistry, credentialAnchor };
});

export default AcademicRepositoryModule;
