import path from 'path';
import fs from 'fs';

export function loadTestResource(resourcePath: string) {
  return fs.readFileSync(getTestResourcePath(resourcePath), 'utf-8');
}

export function getTestResourcePath(resourcePath: string) {
  return createSafePath(path.join('src/redux/utils/__test__', resourcePath));
}

export function createSafePath(originalPath: string) {
  return originalPath.replaceAll('/', path.sep);
}
