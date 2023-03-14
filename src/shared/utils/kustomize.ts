import micromatch from 'micromatch';
import {basename} from 'path';

export function isKustomizationFilePath(filePath: string) {
  return micromatch.isMatch(basename(filePath).toLowerCase(), '*kustomization*.yaml');
}
