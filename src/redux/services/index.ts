import fs from 'fs';
import path from 'path';

/**
 * Gets the absolute path to a statically bundled resource in the /resources folder
 */

export function getStaticResourcePath(resourcePath: string) {
  return process.env.NODE_ENV === 'production'
    ? // @ts-ignore
      path.join(process.resourcesPath, 'resources', resourcePath)
    : path.join('resources', resourcePath);
}

/**
 * Loads the static resource at the specified relative path to /resources
 */

export function loadResource(resourcePath: string) {
  return fs.readFileSync(getStaticResourcePath(resourcePath), 'utf8');
}
