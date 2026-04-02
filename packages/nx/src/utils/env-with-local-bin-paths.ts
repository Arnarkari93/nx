import { delimiter, join, resolve } from 'path';

/**
 * Returns a copy of `process.env` with `node_modules/.bin` directories
 * prepended to PATH, walking up from `cwd` to the filesystem root.
 */
export function getEnvWithLocalBinPaths(
  currentWorkingDir?: string
): NodeJS.ProcessEnv {
  const cwd = currentWorkingDir ?? process.cwd();
  const env = { ...process.env };
  const pathKey = getPathKey(env);
  const existingPath = env[pathKey] ?? '';

  const binPaths: string[] = [];
  let previous: string | undefined;
  let current = resolve(cwd);

  while (previous !== current) {
    binPaths.push(join(current, 'node_modules/.bin'));
    previous = current;
    current = resolve(current, '..');
  }

  // Ensure the running `node` binary is used
  binPaths.push(resolve(cwd, process.execPath, '..'));

  env[pathKey] = binPaths.concat(existingPath).join(delimiter);
  return env;
}

function getPathKey(env: NodeJS.ProcessEnv): string {
  if (process.platform !== 'win32') {
    return 'PATH';
  }

  return Object.keys(env).find((key) => key.toUpperCase() === 'PATH') ?? 'Path';
}
