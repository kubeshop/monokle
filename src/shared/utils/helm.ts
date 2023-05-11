import micromatch from 'micromatch';
import {basename} from 'path';

/**
 * Checks if the specified path is a helm chart template
 */
export function isHelmTemplateFile(filePath: string): boolean {
  return (
    filePath.includes('templates') &&
    ['*.yaml', '*.yml'].some(ext => micromatch.isMatch(basename(filePath).toLowerCase(), ext))
  );
}

/**
 * Checks if the specified path is a helm values file
 */

export function isHelmValuesFile(filePath: string): boolean {
  return micromatch.isMatch(basename(filePath).toLowerCase(), '*values*.yaml');
}

/**
 * Checks if the specified path is a helm chart file
 */

export function isHelmChartFile(filePath: string): boolean {
  return basename(filePath).toLowerCase() === 'chart.yaml';
}
