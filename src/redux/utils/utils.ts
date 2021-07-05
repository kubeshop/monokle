import fs from 'fs';
import path from 'path';

/**
 * Gets the absolute path to a statically bundled resource in the /resources folder
 */

export function getStaticResourcePath(resourcePath: string) {
  return process.env.NODE_ENV === 'development'
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

/**
 * taken from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
 */

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
