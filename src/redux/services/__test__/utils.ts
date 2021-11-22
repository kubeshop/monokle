import fs from 'fs';
import path from 'path';

export function loadTestResource(resourcePath: string) {
  return fs.readFileSync(getTestResourcePath(resourcePath), 'utf-8');
}

export function getTestResourcePath(resourcePath: string) {
  return createSafePath(path.join('src/redux/services/__test__', resourcePath));
}

export function createSafePath(originalPath: string) {
  return originalPath.replaceAll('/', path.sep);
}
