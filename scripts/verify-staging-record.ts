import fs from 'fs';
import path from 'path';
import { runVerifyStaging } from './verify-staging';

const captureConsole = () => {
  const logs: string[] = [];
  const errors: string[] = [];

  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args: unknown[]) => {
    const message = args
      .map((value) => (typeof value === 'string' ? value : JSON.stringify(value)))
      .join(' ');
    logs.push(message);
    originalLog(...args);
  };

  console.error = (...args: unknown[]) => {
    const message = args
      .map((value) => (typeof value === 'string' ? value : JSON.stringify(value)))
      .join(' ');
    errors.push(message);
    originalError(...args);
  };

  return {
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      return { logs, errors };
    }
  };
};

const ensureLogDir = () => {
  const dir = path.resolve(process.cwd(), 'logs', 'verify-staging');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const writeLog = (dir: string, content: string[]) => {
  const logfile = path.join(dir, `verify-${timestamp()}.log`);
  fs.writeFileSync(logfile, `${content.join('\n')}${content.length ? '\n' : ''}`, {
    encoding: 'utf8',
    mode: 0o600
  });
  return logfile;
};

const main = async () => {
  const { restore } = captureConsole();
  const logDir = ensureLogDir();

  try {
    await runVerifyStaging();
    const { logs, errors } = restore();
    const logfile = writeLog(logDir, [...logs, ...errors]);
    console.log(`\nVerification log captured at ${logfile}`);
  } catch (error) {
    const { logs, errors } = restore();
    const logfile = writeLog(logDir, [...logs, ...errors, `ERROR: ${String(error)}`]);
    console.error(`Verification failed. Log written to ${logfile}`);
    throw error;
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
