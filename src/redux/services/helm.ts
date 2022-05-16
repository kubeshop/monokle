import {EventEmitter} from 'events';
import fs from 'fs';
import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {LineCounter, Scalar, parse} from 'yaml';

import {HELM_CHART_ENTRY_FILE} from '@constants/constants';

import {ProjectConfig} from '@models/appconfig';
import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {HelmChart, HelmValueMatch, HelmValuesFile, RangeAndValue} from '@models/helm';

import {
  createFileEntry,
  extractResourcesForFileEntry,
  fileIsExcluded,
  fileIsIncluded,
  getAbsoluteFilePath,
  readFiles,
} from '@redux/services/fileEntry';
import {NodeWrapper} from '@redux/services/resource';

import {getFileStats} from '@utils/files';
import {parseAllYamlDocuments} from '@utils/yaml';

export const HelmChartEventEmitter = new EventEmitter();

/**
 * Gets the HelmValuesFile for a specific FileEntry
 */

export function getHelmValuesFile(fileEntry: FileEntry, helmValuesMap: HelmValuesMapType) {
  return Object.values(helmValuesMap).find(valuesFile => valuesFile.filePath === fileEntry.filePath);
}

/**
 * Gets the HelmChart for a specific FileEntry
 */

export function getHelmChartFromFileEntry(fileEntry: FileEntry, helmChartMap: HelmChartMapType) {
  return Object.values(helmChartMap).find(chart => chart.filePath === fileEntry.filePath);
}

/**
 * Checks if the specified path is a helm values file
 */

export function isHelmValuesFile(filePath: string): boolean {
  return micromatch.isMatch(path.basename(filePath).toLowerCase(), '*values*.yaml');
}

/**
 * Checks if the specified path is a helm chart template
 */
export function isHelmTemplateFile(filePath: string): boolean {
  return (
    filePath.includes('templates') &&
    ['*.yaml', '*.yml'].some(ext => micromatch.isMatch(path.basename(filePath).toLowerCase(), ext))
  );
}

/**
 * Checks if the specified path is a helm chart file
 */

export function isHelmChartFile(filePath: string): boolean {
  return path.basename(filePath).toLowerCase() === 'chart.yaml';
}

/**
 * Checks if the specified files are a Helm Chart folder
 */

export function isHelmChartFolder(files: string[]): boolean {
  return files.indexOf(HELM_CHART_ENTRY_FILE) !== -1;
}

/**
 * Adds the values file at the given path to the specified HelmChart
 */

interface CreateHelmValuesFileParams {
  fileEntry: FileEntry;
  helmChart: HelmChart;
  helmValuesMap: HelmValuesMapType;
  fileMap: FileMapType;
}

const get = (t: object, objPath: string) => objPath.split('.').reduce((r, k) => (r as any)?.[k], t);

const getYamlScalar = (contents: any, keyPath: string): Scalar | undefined => {
  const keyParts = keyPath.split('.');
  const keyStart = keyParts.shift();
  const pair = contents.items.find((item: any) => {
    return item.key.value === keyStart;
  });
  if (!pair) {
    return;
  }

  if (!keyParts.length) {
    return pair.value;
  }

  return getYamlScalar(pair.value, keyParts.join('.'));
};

export function createHelmValuesFile({fileEntry, helmChart, helmValuesMap, fileMap}: CreateHelmValuesFileParams) {
  const filePath = getAbsoluteFilePath(fileEntry.filePath, fileMap);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lineCounter = new LineCounter();
  const documents = parseAllYamlDocuments(fileContent, lineCounter);

  const values: HelmValueMatch[] = [];
  documents.forEach(doc => {
    const helmObject = doc.toJS();
    getObjectKeys(helmObject).forEach(keyPath => {
      const scalar = getYamlScalar(doc.contents, keyPath);
      if (!scalar) {
        return;
      }
      const nodeWrapper = new NodeWrapper(scalar, lineCounter);
      values.push({
        value: get(helmObject, keyPath),
        keyPath: `.Values.${keyPath}`,
        linePosition: nodeWrapper.getNodePosition(),
      });
    });
  });

  const helmValues: HelmValuesFile = {
    id: uuidv4(),
    filePath: fileEntry.filePath,
    name: path.basename(fileEntry.filePath),
    isSelected: false,
    helmChartId: helmChart.id,
    values,
  };

  helmValuesMap[helmValues.id] = helmValues;
  helmChart.valueFileIds.push(helmValues.id);
  fileEntry.isSupported = true;
}

export function createHelmFile(fileEntry: FileEntry, helmChart: HelmChart, fileMap: FileMapType) {
  const filePath = getAbsoluteFilePath(fileEntry.filePath, fileMap);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const valueRanges = getHelmValueRanges(fileContent);

  helmChart.templateFilePaths.push({
    id: uuidv4(),
    filePath: fileEntry.filePath,
    values: valueRanges,
  });
}

/**
 * Processes the specified folder as containing a Helm Chart
 */

export function processHelmChartFolder(
  folder: string,
  rootFolder: string,
  files: string[],
  projectConfig: ProjectConfig,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType,
  depth: number
) {
  const result: string[] = [];

  // pre-emptively create helm chart file entry
  const helmChartFilePath = path.join(folder, HELM_CHART_ENTRY_FILE);
  const helmChartFileEntry = createFileEntry({
    fileEntryPath: helmChartFilePath.substring(rootFolder.length),
    fileMap,
  });
  const helmChart = createHelmChart(helmChartFileEntry, helmChartFilePath, helmChartMap);
  result.push(helmChartFileEntry.name);

  files
    .filter(file => !isHelmChartFile(file))
    .forEach(file => {
      const filePath = path.join(folder, file);
      const fileEntryPath = filePath.substring(rootFolder.length);
      const fileEntry = createFileEntry({fileEntryPath, fileMap, helmChartId: helmChart.id});
      log.info(`helm helm file: ${filePath}`);

      if (fileIsExcluded(fileEntry, projectConfig)) {
        fileEntry.isExcluded = true;
      } else if (getFileStats(filePath)?.isDirectory()) {
        const folderReadsMaxDepth = projectConfig.folderReadsMaxDepth;

        if (depth === folderReadsMaxDepth) {
          log.warn(`[readFiles]: Ignored ${filePath} because max depth was reached.`);
        } else {
          fileEntry.children = readFiles(
            filePath,
            projectConfig,
            resourceMap,
            fileMap,
            helmChartMap,
            helmValuesMap,
            depth + 1,
            helmChart
          );
        }
      } else if (isHelmValuesFile(file)) {
        createHelmValuesFile({
          fileEntry,
          helmChart,
          helmValuesMap,
          fileMap,
        });
      } else if (!isHelmChartFile(filePath) && fileIsIncluded(fileEntry, projectConfig)) {
        extractResourcesForFileEntry(fileEntry, fileMap, resourceMap);
      } else if (isHelmTemplateFile(fileEntry.filePath)) {
        createHelmFile(fileEntry, helmChart, fileMap);
      }

      result.push(fileEntry.name);
    });

  return result;
}

/**
 * Extract the name of the provided helm chart file
 */

export function getHelmChartName(chartFilePath: string) {
  const fileText = fs.readFileSync(chartFilePath, 'utf8');
  const fileContent = parse(fileText);

  if (typeof fileContent?.name !== 'string') {
    return `Unamed Chart: ${path.dirname(chartFilePath)}`;
  }

  return fileContent.name;
}

/**
 * Creates a HelmChart for the specified fileEntry
 */

export function createHelmChart(fileEntry: FileEntry, absolutePath: string, helmChartMap: HelmChartMapType) {
  const helmChart: HelmChart = {
    id: uuidv4(),
    filePath: fileEntry.filePath,
    name: getHelmChartName(absolutePath),
    valueFileIds: [],
    templateFilePaths: [],
  };

  fileEntry.isSupported = true;

  helmChartMap[helmChart.id] = helmChart;
  setImmediate(() => HelmChartEventEmitter.emit('create', helmChart));
  return helmChart;
}

/**
 * Returns a list of Helm charts "containing" the specified fileEntry, with the most immediate Helm
 * chart first
 */

export function findContainingHelmCharts(helmChartMap: HelmChartMapType, fileEntry: FileEntry) {
  const charts = Object.values(helmChartMap)
    .filter(chart => fileEntry.filePath.startsWith(path.dirname(chart.filePath)))
    .sort((chart1: HelmChart, chart2: HelmChart) => {
      // sort by path -> longest path must be the most immediate parent
      return chart2.filePath.length - chart1.filePath.length;
    });
  return charts;
}

/**
 * get all keys paths for an object not just bottom leafs
 * for object { a: 1, b: { c: 2 } } it would return ['a', 'b', 'b.c']
 * @param obj
 * @param prefix
 */
export const getObjectKeys = (obj: any, prefix = ''): string[] =>
  Object.keys(obj).reduce((res: any, el) => {
    if (Array.isArray(obj[el])) {
      return [...res, prefix + el];
    }
    if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, prefix + el, ...getObjectKeys(obj[el], `${prefix + el}.`)];
    }
    return [...res, prefix + el];
  }, []);

export const getHelmValueRanges = (code: string | undefined): RangeAndValue[] => {
  const ranges: RangeAndValue[] = [];
  if (!code) {
    return ranges;
  }

  const valuesMatches = code?.matchAll(/\s.Values.+?(?=\s.|}})/g);
  if (!valuesMatches) {
    return ranges;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const matchValue of valuesMatches) {
    const matchedValue = matchValue[0];
    if (!matchValue.input || !matchValue.index) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const lines = matchValue.input.split('\n');
    const lineNumber = code?.substring(0, matchValue.index).match(/\n/g)?.length as number;
    if (!lineNumber) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const line = lines[lineNumber];
    const start = line.split(matchedValue);

    ranges.push({
      range: {
        startLineNumber: lineNumber + 1,
        startColumn: start[0].length + 2,
        endLineNumber: lineNumber + 1,
        endColumn: start[0].length + matchedValue.length + 1,
      },
      value: matchedValue.substring(1, matchedValue.length),
    });
  }

  return ranges;
};
