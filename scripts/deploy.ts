import hre from 'hardhat';

const { ethers } = hre;

function readEnvInteger(key: string, fallback: number) {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseAddressList(key: string, fallback: string[] = []): string[] {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => ethers.getAddress(value));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with:', deployer.address);

  const registry = await ethers.deployContract('LabRegistry', [deployer.address]);
  await registry.waitForDeployment();
  console.log('LabRegistry deployed to:', await registry.getAddress());

  const token = await ethers.deployContract('LabGovernorToken', [deployer.address]);
  await token.waitForDeployment();
  console.log('LabGovernorToken deployed to:', await token.getAddress());

  const minDelaySeconds = readEnvInteger('GOVERNOR_TIMELOCK_DELAY', 3600);
  const timelock = await ethers.deployContract('TimelockController', [
    minDelaySeconds,
    [],
    [],
    deployer.address
  ]);
  await timelock.waitForDeployment();
  console.log('TimelockController deployed to:', await timelock.getAddress());

  const votingDelayBlocks = readEnvInteger('GOVERNOR_VOTING_DELAY_BLOCKS', 1);
  const votingPeriodBlocks = readEnvInteger('GOVERNOR_VOTING_PERIOD_BLOCKS', 45818); // ~1 week on Polygon
  const proposalThreshold = ethers.parseEther(
    (process.env.GOVERNOR_PROPOSAL_THRESHOLD ?? '10').toString()
  );
  const quorumFraction = readEnvInteger('GOVERNOR_QUORUM_FRACTION', 10);

  const dao = await ethers.deployContract('LabDAO', [
    await token.getAddress(),
    await timelock.getAddress(),
    votingDelayBlocks,
    votingPeriodBlocks,
    proposalThreshold,
    quorumFraction
  ]);
  await dao.waitForDeployment();
  console.log('LabDAO (Governor) deployed to:', await dao.getAddress());

  const proposerRole = await timelock.PROPOSER_ROLE();
  const executorRole = await timelock.EXECUTOR_ROLE();
  const adminRole = await timelock.DEFAULT_ADMIN_ROLE();

  await (await timelock.grantRole(proposerRole, await dao.getAddress())).wait();
  await (await timelock.grantRole(executorRole, ethers.ZeroAddress)).wait();
  await (await timelock.revokeRole(adminRole, deployer.address)).wait();

  await (await token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).wait();
  console.log('Timelock granted minter role on LabGovernorToken');

  const defaultAdmins = parseAddressList('GOVERNANCE_DEFAULT_ADMINS');
  for (const admin of defaultAdmins) {
    if (admin.toLowerCase() !== deployer.address.toLowerCase()) {
      await (await timelock.grantRole(adminRole, admin)).wait();
      console.log(`Granted DEFAULT_ADMIN_ROLE to ${admin}`);
    }
  }

  const defaultProposers = parseAddressList('GOVERNANCE_DEFAULT_PROPOSERS');
  for (const proposer of defaultProposers) {
    await (await timelock.grantRole(proposerRole, proposer)).wait();
    console.log(`Granted PROPOSER_ROLE to ${proposer}`);
  }

  const defaultExecutors = parseAddressList('GOVERNANCE_DEFAULT_EXECUTORS');
  for (const executor of defaultExecutors) {
    await (await timelock.grantRole(executorRole, executor)).wait();
    console.log(`Granted EXECUTOR_ROLE to ${executor}`);
  }

  const artifactRegistry = await ethers.deployContract('ArtifactRegistry', [deployer.address]);
  await artifactRegistry.waitForDeployment();
  console.log('ArtifactRegistry deployed to:', await artifactRegistry.getAddress());

  const credentialAnchor = await ethers.deployContract('CredentialAnchor', [deployer.address]);
  await credentialAnchor.waitForDeployment();
  console.log('CredentialAnchor deployed to:', await credentialAnchor.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
