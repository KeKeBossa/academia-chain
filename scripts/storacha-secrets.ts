import {
  applySecretTargets,
  normalizeSecrets,
  type SecretTargets,
  type StorachaSecrets
} from './lib/storacha-secrets';

type CliOptions = StorachaSecrets & SecretTargets;

const parseArgs = (): CliOptions => {
  const options: Partial<CliOptions> = {};
  for (let i = 0; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (!arg.startsWith('--')) continue;
    const next = process.argv[i + 1];
    switch (arg) {
      case '--principal':
        options.principal = next;
        break;
      case '--proof':
        options.proof = next;
        break;
      case '--space':
        options.spaceDid = next;
        break;
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
      default:
        break;
    }
  }
  return options as CliOptions;
};

const usage = () => {
  console.log(
    'Usage: npm run storacha:secrets -- --principal <base64> --proof <base64> --space <did:key:...> [--env .env] [--json path] [--github-env staging] [--aws-secret name]'
  );
};

const main = () => {
  const options = parseArgs();
  if (!options.principal || !options.proof || !options.spaceDid) {
    usage();
    throw new Error('Missing required Storacha secret arguments.');
  }

  const secrets = normalizeSecrets({
    principal: options.principal,
    proof: options.proof,
    spaceDid: options.spaceDid
  });

  const targets: SecretTargets = {
    envFile: options.envFile,
    jsonOut: options.jsonOut,
    githubEnv: options.githubEnv,
    awsSecret: options.awsSecret
  };

  applySecretTargets(secrets, targets);
};

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
