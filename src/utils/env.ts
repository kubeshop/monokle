// weird workaround to get all ENV values (accessing process.env directly only returns a subset)
// export const PROCESS_ENV = JSON.parse(JSON.stringify(process)).env;
// @ts-nocheck
import execa from 'execa';
import stripAnsi from 'strip-ansi';

const args = ['-ilc', 'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit'];

const ENV = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: 'true',
};

const detectShell = () => {
  const {env} = process;

  if (process.platform === 'win32') {
    return env.COMSPEC || 'cmd.exe';
  }

  if (process.platform === 'darwin') {
    return env.SHELL || '/bin/zsh';
  }

  return env.SHELL || '/bin/sh';
};

const detectedShell = detectShell();

const parseEnv = env => {
  env = env.split('_SHELL_ENV_DELIMITER_')[1];
  const returnValue = {};

  stripAnsi(env)
    .split('\n')
    .filter(filteredLine => Boolean(filteredLine))
    .forEach(line => {
      const [key, ...values] = line.split('=');
      returnValue[key] = values.join('=');
    });

  return returnValue;
};

function shellEnvSync() {
  if (process.platform === 'win32') {
    return process.env;
  }

  try {
    const {stdout} = execa.sync(detectedShell, args, {extendEnv: true, env: ENV});
    return parseEnv(stdout);
  } catch (error) {
    if (detectedShell) {
      throw error;
    } else {
      return process.env;
    }
  }
}
export const PROCESS_ENV: any = shellEnvSync();
