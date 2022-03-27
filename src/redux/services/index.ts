import fs from 'fs';
import path from 'path';

import {getMainProcessEnv} from '@utils/env';

/**
 * Gets the absolute path to a statically bundled resource in the /resources folder
 */

export function getStaticResourcePath(resourcePath: string) {
  const mainProcessEnv = getMainProcessEnv();
  if (mainProcessEnv?.NODE_ENV === 'test') {
    return path.join('resources', resourcePath);
  }

  return mainProcessEnv?.NODE_ENV !== 'development'
    ? path.join(process.resourcesPath, 'resources', resourcePath)
    : path.join('resources', resourcePath);
}

/**
 * Loads the static resource at the specified relative path to /resources
 */

export function loadResource(resourcePath: string) {
  const staticResourcePath = getStaticResourcePath(resourcePath);
  return fs.existsSync(staticResourcePath) ? fs.readFileSync(staticResourcePath, 'utf8') : undefined;
}
