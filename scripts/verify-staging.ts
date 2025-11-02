import 'dotenv/config';
import { createPublicClient, getAddress, http } from 'viem';
import { polygonAmoy, sepolia } from 'viem/chains';

const REQUIRED_ENV_KEYS = [
  'STORACHA_PRINCIPAL',
  'STORACHA_PROOF',
  'STORACHA_SPACE_DID',
  'ARTIFACT_REGISTRY_ADDRESS',
  'ARTIFACT_REGISTRY_PRIVATE_KEY',
  'ARTIFACT_REGISTRY_RPC_URL',
  'CREDENTIAL_ANCHOR_ADDRESS',
  'CREDENTIAL_ANCHOR_RPC_URL',
  'GOVERNOR_TIMELOCK_DELAY',
  'GOVERNOR_VOTING_DELAY_BLOCKS',
  'GOVERNOR_VOTING_PERIOD_BLOCKS',
  'GOVERNOR_PROPOSAL_THRESHOLD',
  'GOVERNOR_QUORUM_FRACTION'
] as const;

const isPlaceholder = (value: string | undefined) =>
  !value || value.includes('replace-with') || value.includes('your-key');

type EnsureEnvOptions = {
  allowPlaceholders?: boolean;
};

const ensureEnv = (options: EnsureEnvOptions = {}) => {
  const { allowPlaceholders = false } = options;
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (allowPlaceholders) {
    return;
  }

  const placeholders = REQUIRED_ENV_KEYS.filter((key) => isPlaceholder(process.env[key]));
  if (placeholders.length > 0) {
    throw new Error(
      `Environment variables still contain placeholder values: ${placeholders.join(', ')}`
    );
  }
};

const parseAddress = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is not defined`);
  }
  try {
    return getAddress(value as `0x${string}`);
  } catch (error) {
    throw new Error(`${name} is not a valid address: ${String(error)}`);
  }
};

const parseInteger = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is not defined`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number, got ${value}`);
  }
  return parsed;
};

const ensureBase64 = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is not defined`);
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${name} is not defined`);
  }
  try {
    const decoded = Buffer.from(normalized, 'base64');
    if (decoded.length === 0) {
      throw new Error(`${name} must be a non-empty base64 string`);
    }
  } catch (error) {
    throw new Error(`${name} must be base64 encoded: ${String(error)}`);
  }
};

const validateStorachaConfig = () => {
  ensureBase64(process.env.STORACHA_PRINCIPAL, 'STORACHA_PRINCIPAL');
  ensureBase64(process.env.STORACHA_PROOF, 'STORACHA_PROOF');

  const spaceDid = process.env.STORACHA_SPACE_DID;
  if (!spaceDid) {
    throw new Error('STORACHA_SPACE_DID is not defined');
  }
  if (!spaceDid.startsWith('did:key:')) {
    throw new Error('STORACHA_SPACE_DID must be a did:key DID');
  }
};

export const runVerifyStaging = async () => {
  const stagingMode = (process.env.STAGING_MODE ?? '').toLowerCase();
  ensureEnv({ allowPlaceholders: stagingMode === 'dry-run' });
  validateStorachaConfig();

  if (stagingMode === 'dry-run') {
    console.log(
      'Running staging verification in dry-run mode – skipping network and deployment checks.'
    );

    const summarizeSecret = (value: string | undefined) =>
      value && value.length > 8
        ? `${value.slice(0, 4)}...${value.slice(-4)} (${value.length} chars)`
        : 'unset';

    const summarizeAddress = (value: string | undefined, name: string) => {
      try {
        const parsed = parseAddress(value, name);
        return `${parsed.slice(0, 6)}...${parsed.slice(-4)}`;
      } catch (error) {
        return `invalid (${error instanceof Error ? error.message : String(error)})`;
      }
    };

    const summarizeNumber = (value: string | undefined, name: string) => {
      try {
        return `${parseInteger(value, name)}`;
      } catch (error) {
        return `invalid (${error instanceof Error ? error.message : String(error)})`;
      }
    };

    console.log('\nStoracha secrets:');
    console.log(`  principal: ${summarizeSecret(process.env.STORACHA_PRINCIPAL)}`);
    console.log(`  proof: ${summarizeSecret(process.env.STORACHA_PROOF)}`);
    console.log(`  space DID: ${process.env.STORACHA_SPACE_DID}`);

    console.log('\nContract configuration:');
    console.log(
      `  ArtifactRegistry address: ${summarizeAddress(
        process.env.ARTIFACT_REGISTRY_ADDRESS,
        'ARTIFACT_REGISTRY_ADDRESS'
      )}`
    );
    console.log(
      `  CredentialAnchor address: ${summarizeAddress(
        process.env.CREDENTIAL_ANCHOR_ADDRESS,
        'CREDENTIAL_ANCHOR_ADDRESS'
      )}`
    );

    console.log('\nGovernor parameters:');
    console.log(
      `  timelock delay (s): ${summarizeNumber(process.env.GOVERNOR_TIMELOCK_DELAY, 'GOVERNOR_TIMELOCK_DELAY')}`
    );
    console.log(
      `  voting delay (blocks): ${summarizeNumber(
        process.env.GOVERNOR_VOTING_DELAY_BLOCKS,
        'GOVERNOR_VOTING_DELAY_BLOCKS'
      )}`
    );
    console.log(
      `  voting period (blocks): ${summarizeNumber(
        process.env.GOVERNOR_VOTING_PERIOD_BLOCKS,
        'GOVERNOR_VOTING_PERIOD_BLOCKS'
      )}`
    );
    console.log(
      `  proposal threshold: ${summarizeNumber(
        process.env.GOVERNOR_PROPOSAL_THRESHOLD,
        'GOVERNOR_PROPOSAL_THRESHOLD'
      )}`
    );
    console.log(
      `  quorum fraction: ${summarizeNumber(
        process.env.GOVERNOR_QUORUM_FRACTION,
        'GOVERNOR_QUORUM_FRACTION'
      )}`
    );

    console.log('\nDry-run staging verification completed ✅');
    return;
  }

  const artifactRegistryAddress = parseAddress(
    process.env.ARTIFACT_REGISTRY_ADDRESS,
    'ARTIFACT_REGISTRY_ADDRESS'
  );
  const credentialAnchorAddress = parseAddress(
    process.env.CREDENTIAL_ANCHOR_ADDRESS,
    'CREDENTIAL_ANCHOR_ADDRESS'
  );

  const timelockDelay = parseInteger(
    process.env.GOVERNOR_TIMELOCK_DELAY,
    'GOVERNOR_TIMELOCK_DELAY'
  );
  const votingDelay = parseInteger(
    process.env.GOVERNOR_VOTING_DELAY_BLOCKS,
    'GOVERNOR_VOTING_DELAY_BLOCKS'
  );
  const votingPeriod = parseInteger(
    process.env.GOVERNOR_VOTING_PERIOD_BLOCKS,
    'GOVERNOR_VOTING_PERIOD_BLOCKS'
  );
  const proposalThreshold = parseInteger(
    process.env.GOVERNOR_PROPOSAL_THRESHOLD,
    'GOVERNOR_PROPOSAL_THRESHOLD'
  );
  const quorumFraction = parseInteger(
    process.env.GOVERNOR_QUORUM_FRACTION,
    'GOVERNOR_QUORUM_FRACTION'
  );

  console.log('Governor params:');
  console.log(`  timelock delay (s): ${timelockDelay}`);
  console.log(`  voting delay (blocks): ${votingDelay}`);
  console.log(`  voting period (blocks): ${votingPeriod}`);
  console.log(`  proposal threshold: ${proposalThreshold}`);
  console.log(`  quorum fraction: ${quorumFraction}`);

  const rpcUrlRaw =
    process.env.ARTIFACT_REGISTRY_RPC_URL ??
    process.env.CREDENTIAL_ANCHOR_RPC_URL ??
    process.env.POLYGON_AMOY_RPC_URL ??
    process.env.SEPOLIA_RPC_URL ??
    'hardhat';

  const rpcUrl = rpcUrlRaw.trim().toLowerCase();

  if (rpcUrl === 'hardhat' || process.env.STAGING_MODE === 'local') {
    console.log('Running in local staging mode – verifying contracts via Hardhat provider.');
    const hre = await import('hardhat');
    const hardhatEthers = (hre as any).ethers;
    const [deployer] = await hardhatEthers.getSigners();

    const registry = await (
      await hardhatEthers.getContractFactory('LabRegistry', deployer)
    ).deploy(deployer.address);
    await registry.waitForDeployment();

    const governorToken = await (
      await hardhatEthers.getContractFactory('LabGovernorToken', deployer)
    ).deploy(deployer.address);
    await governorToken.waitForDeployment();

    const timelock = await (
      await hardhatEthers.getContractFactory('TimelockController', deployer)
    ).deploy(3600, [], [], deployer.address);
    await timelock.waitForDeployment();

    const dao = await (
      await hardhatEthers.getContractFactory('LabDAO', deployer)
    ).deploy(await governorToken.getAddress(), await timelock.getAddress(), 1, 7200, 10, 10);
    await dao.waitForDeployment();

    const proposerRole = await timelock.PROPOSER_ROLE();
    const executorRole = await timelock.EXECUTOR_ROLE();
    const adminRole = await timelock.DEFAULT_ADMIN_ROLE();
    const minterRole = await governorToken.MINTER_ROLE();

    await (await timelock.grantRole(proposerRole, await dao.getAddress())).wait();
    await (await timelock.grantRole(executorRole, hardhatEthers.ZeroAddress)).wait();
    await (await timelock.revokeRole(adminRole, deployer.address)).wait();
    await (await governorToken.grantRole(minterRole, await timelock.getAddress())).wait();

    const artifactRegistry = await (
      await hardhatEthers.getContractFactory('ArtifactRegistry', deployer)
    ).deploy(deployer.address);
    await artifactRegistry.waitForDeployment();

    const credentialAnchor = await (
      await hardhatEthers.getContractFactory('CredentialAnchor', deployer)
    ).deploy(deployer.address);
    await credentialAnchor.waitForDeployment();

    const deployedArtifactAddress = (await artifactRegistry.getAddress()).toLowerCase();
    const deployedCredentialAddress = (await credentialAnchor.getAddress()).toLowerCase();

    if (deployedArtifactAddress !== artifactRegistryAddress.toLowerCase()) {
      throw new Error(
        `Environment ARTIFACT_REGISTRY_ADDRESS (${artifactRegistryAddress}) does not match deterministic Hardhat deployment (${deployedArtifactAddress}).`
      );
    }

    if (deployedCredentialAddress !== credentialAnchorAddress.toLowerCase()) {
      throw new Error(
        `Environment CREDENTIAL_ANCHOR_ADDRESS (${credentialAnchorAddress}) does not match deterministic Hardhat deployment (${deployedCredentialAddress}).`
      );
    }

    console.log('Local Hardhat deployment matches staged configuration.');
  } else {
    const chain = rpcUrl.includes('sepolia') ? sepolia : polygonAmoy;
    console.log(`Connecting to ${chain.name} via ${rpcUrlRaw}`);

    const client = createPublicClient({
      chain,
      transport: http(rpcUrlRaw, { timeout: 10_000 })
    });

    const blockNumber = await client.getBlockNumber();
    console.log(`Latest block number: ${blockNumber}`);

    const artifactRegistryCode = await client.getBytecode({ address: artifactRegistryAddress });
    if (!artifactRegistryCode) {
      throw new Error('ArtifactRegistry contract is not deployed at the configured address.');
    }
    console.log('ArtifactRegistry bytecode detected.');

    const credentialAnchorCode = await client.getBytecode({ address: credentialAnchorAddress });
    if (!credentialAnchorCode) {
      throw new Error('CredentialAnchor contract is not deployed at the configured address.');
    }
    console.log('CredentialAnchor bytecode detected.');
  }

  console.log('Staging environment verification completed successfully ✅');
};

if (require.main === module) {
  runVerifyStaging().catch((error) => {
    console.error('Staging environment verification failed:', error);
    process.exitCode = 1;
  });
}
