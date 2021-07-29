// @ts-ignore
import shellPath from 'shell-path';

let cachedShellPath: string | undefined;

export function getShellPath() {
  if (cachedShellPath === undefined) {
    cachedShellPath = shellPath.sync();
  }

  return cachedShellPath;
}
