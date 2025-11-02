import fs from 'fs';
import path from 'path';

export type StorachaSecrets = {
  principal: string;
  proof: string;
  spaceDid: string;
};

export type SecretTargets = {
  envFile?: string;
  jsonOut?: string;
  githubEnv?: string;
  awsSecret?: string;
};

export const ensureBase64 = (value: string, name: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${name} must not be empty`);
  }
  try {
    const decoded = Buffer.from(trimmed, 'base64');
    if (decoded.length === 0) {
      throw new Error(`${name} must decode to a non-empty buffer`);
    }
  } catch (error) {
    throw new Error(`${name} must be base64 encoded: ${String(error)}`);
  }
};

export const ensureDid = (value: string, name: string) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('did:key:')) {
    throw new Error(`${name} must start with did:key:`);
  }
};

const loadEnvLines = (filePath: string): string[] => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const contents = fs.readFileSync(filePath, 'utf8');
  return contents.split(/\r?\n/);
};

const writeEnvFile = (filePath: string, entries: Record<string, string>) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const lines = loadEnvLines(filePath);
  const result: string[] = [];
  const handled = new Set<string>();

  lines.forEach((line) => {
    if (!line || line.startsWith('#') || !line.includes('=')) {
      result.push(line);
      return;
    }
    const [key] = line.split('=');
    if (key && entries[key] !== undefined) {
      result.push(`${key}=${entries[key]}`);
      handled.add(key);
    } else {
      result.push(line);
    }
  });

  Object.entries(entries).forEach(([key, value]) => {
    if (handled.has(key)) {
      return;
    }
    result.push(`${key}=${value}`);
  });

  const sanitized = result.filter((line, index, array) => {
    if (line === '' && array[index - 1] === '') {
      return false;
    }
    return true;
  });

  fs.writeFileSync(filePath, `${sanitized.join('\n')}${sanitized.length ? '\n' : ''}`, {
    encoding: 'utf8',
    mode: 0o600
  });
};

const writeJsonSecret = (filePath: string, entries: Record<string, string>) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, `${JSON.stringify(entries, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600
  });
};

const printGithubCommands = (environment: string, entries: Record<string, string>) => {
  console.log(`\n# GitHub Actions secret commands (${environment})`);
  Object.entries(entries).forEach(([key, value]) => {
    console.log(`echo '${value}' | gh secret set ${key} --env ${environment}`);
  });
};

const printAwsCommand = (secretName: string, entries: Record<string, string>) => {
  console.log(`\n# AWS Secrets Manager payload (${secretName})`);
  console.log(
    `aws secretsmanager put-secret-value --secret-id ${secretName} --secret-string '${JSON.stringify(
      entries
    )}'`
  );
};

export const normalizeSecrets = (raw: StorachaSecrets): StorachaSecrets => {
  ensureBase64(raw.principal, 'STORACHA_PRINCIPAL');
  ensureBase64(raw.proof, 'STORACHA_PROOF');
  ensureDid(raw.spaceDid, 'STORACHA_SPACE_DID');
  return {
    principal: raw.principal.trim(),
    proof: raw.proof.trim(),
    spaceDid: raw.spaceDid.trim()
  };
};

export const applySecretTargets = (secrets: StorachaSecrets, targets: SecretTargets) => {
  const entries: Record<string, string> = {
    STORACHA_PRINCIPAL: secrets.principal,
    STORACHA_PROOF: secrets.proof,
    STORACHA_SPACE_DID: secrets.spaceDid
  };

  if (targets.envFile) {
    writeEnvFile(path.resolve(process.cwd(), targets.envFile), entries);
    console.log(`Updated ${targets.envFile} with Storacha credentials.`);
  }

  if (targets.jsonOut) {
    writeJsonSecret(path.resolve(process.cwd(), targets.jsonOut), entries);
    console.log(`Wrote Storacha secret bundle to ${targets.jsonOut}.`);
  }

  if (targets.githubEnv) {
    printGithubCommands(targets.githubEnv, entries);
  }

  if (targets.awsSecret) {
    printAwsCommand(targets.awsSecret, entries);
  }

  if (!targets.envFile && !targets.jsonOut && !targets.githubEnv && !targets.awsSecret) {
    console.log('No output target specified – printing env block:\n');
    Object.entries(entries).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
  }
};
