import { execFile } from 'child_process';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { applySecretTargets, normalizeSecrets } from './lib/storacha-secrets';

const execFileAsync = promisify(execFile);

type BootstrapOptions = {
  envFile?: string;
  jsonOut?: string;
  githubEnv?: string;
  awsSecret?: string;
  label?: string;
  dryRun?: boolean;
};

const parseArgs = (): BootstrapOptions => {
  const options: BootstrapOptions = {};
  for (let i = 0; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    const next = process.argv[i + 1];
    if (!arg.startsWith('--')) continue;
    switch (arg) {
      case '--env':
        options.envFile = next;
        break;
      case '--json':
        options.jsonOut = next;
        break;
      case '--github-env':
        options.githubEnv = next;
        break;
      case '--aws-secret':
        options.awsSecret = next;
        break;
      case '--label':
        options.label = next;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      default:
        break;
    }
  }
  return options;
};

const usage = () => {
  console.log(
    'Usage: npm run storacha:bootstrap -- [--env .env] [--json path] [--github-env staging] [--aws-secret name] [--label workspace] [--dry-run]'
  );
  console.log('Requires @storacha/cli to be installed globally (npm install -g @storacha/cli).');
};

const randomBase64 = (size: number) => randomBytes(size).toString('base64');

const generateDryRunSecrets = () => {
  const spaceId = randomBytes(8).toString('hex');
  return normalizeSecrets({
    principal: randomBase64(32),
    proof: randomBase64(96),
    spaceDid: `did:key:z${spaceId}`
  });
};

const runStorachaJson = async (args: string[]) => {
  const { stdout } = await execFileAsync('storacha', [...args, '--json'], {
    env: process.env,
    maxBuffer: 10 * 1024 * 1024
  });
  return JSON.parse(stdout);
};

const runStorachaBase64 = async (args: string[]) => {
  const { stdout } = await execFileAsync('storacha', [...args, '--base64'], {
    env: process.env,
    maxBuffer: 10 * 1024 * 1024
  });
  return stdout.trim();
};

const main = async () => {
  const options = parseArgs();

  try {
    if (options.dryRun) {
      console.log('Running Storacha bootstrap in dry-run mode (no CLI calls will be made).');
      const dryRunSecrets = generateDryRunSecrets();
      applySecretTargets(dryRunSecrets, {
        envFile: options.envFile,
        jsonOut: options.jsonOut,
        githubEnv: options.githubEnv,
        awsSecret: options.awsSecret
      });
      console.log('\nStoracha dry-run secrets generated (random test values).');
      console.log(`Space DID: ${dryRunSecrets.spaceDid}`);
      if (options.label) {
        console.log(`Label: ${options.label}`);
      }
      return;
    }

    const space = await runStorachaJson(['space', 'create']);
    const did: string = space.did ?? space.space?.did;
    if (!did) {
      throw new Error('Unable to determine space DID from storacha space create output.');
    }

    if (space.proof) {
      console.log('Space delegation proof returned on creation.');
    }

    const key = await runStorachaJson(['key', 'create']);
    const principal: string = key.key ?? key.principal;
    if (!principal) {
      throw new Error('Unable to determine principal from storacha key create output.');
    }

    const proof = await runStorachaBase64([
      'delegation',
      'create',
      did,
      '-c',
      'space/blob/add',
      '-c',
      'space/index/add',
      '-c',
      'filecoin/offer',
      '-c',
      'upload/add'
    ]);

    const normalized = normalizeSecrets({
      principal,
      proof,
      spaceDid: did
    });

    applySecretTargets(normalized, {
      envFile: options.envFile,
      jsonOut: options.jsonOut,
      githubEnv: options.githubEnv,
      awsSecret: options.awsSecret
    });

    console.log('\nStoracha bootstrap complete.');
    console.log(`Space DID: ${normalized.spaceDid}`);
    if (options.label) {
      console.log(`Label: ${options.label}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      usage();
      throw new Error('storacha CLI not found in PATH. Install with npm install -g @storacha/cli');
    }
    throw error;
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
