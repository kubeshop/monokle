import fs from 'fs';
import path from 'path';
import {PROCESS_ENV} from '@utils/env';

/**
 * Gets the absolute path to a statically bundled resource in the /resources folder
 */

export function getStaticResourcePath(resourcePath: string) {
  return PROCESS_ENV.NODE_ENV === 'development'
    ? path.join('resources', resourcePath)
    : // @ts-ignore
      path.join(process.resourcesPath, 'resources', resourcePath);
}

/**
 * Loads the static resource at the specified relative path to /resources
 */

export function loadResource(resourcePath: string) {
  return fs.readFileSync(getStaticResourcePath(resourcePath), 'utf8');
}
