import fs from 'fs';
import path from 'path';

import {PROCESS_ENV, RESOURCES_PATH} from '@utils/env';

/**
 * Gets the absolute path to a statically bundled resource in the /resources folder
 */

export function getStaticResourcePath(resourcePath: string) {
  if (PROCESS_ENV.NODE_ENV === 'test') {
    return path.join('resources', resourcePath);
  }

  return PROCESS_ENV.NODE_ENV !== 'development'
    ? path.join(RESOURCES_PATH, 'resources', resourcePath)
    : path.join('resources', resourcePath);
}

/**
 * Loads the static resource at the specified relative path to /resources
 */

export function loadResource(resourcePath: string) {
  return fs.readFileSync(getStaticResourcePath(resourcePath), 'utf8');
}
