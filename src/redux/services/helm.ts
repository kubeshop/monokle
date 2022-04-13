import {EventEmitter} from 'events';
import fs from 'fs';
import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {parse} from 'yaml';

import {HELM_CHART_ENTRY_FILE} from '@constants/constants';

import {ProjectConfig} from '@models/appconfig';
import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {HelmChart, HelmValuesFile} from '@models/helm';

import {
  createFileEntry,
  extractResourcesForFileEntry,
  fileIsExcluded,
  fileIsIncluded,
  readFiles,
} from '@redux/services/fileEntry';

import {getFileStats} from '@utils/files';

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

export function createHelmValuesFile(fileEntry: FileEntry, helmChart: HelmChart, helmValuesMap: HelmValuesMapType) {
  const helmValues: HelmValuesFile = {
    id: uuidv4(),
    filePath: fileEntry.filePath,
    name: fileEntry.filePath.substring(path.dirname(helmChart.filePath).length + 1),
    isSelected: false,
    helmChartId: helmChart.id,
  };

  helmValuesMap[helmValues.id] = helmValues;
  helmChart.valueFileIds.push(helmValues.id);
  fileEntry.isSupported = true;
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
      helmChart.otherFilePaths.push(fileEntryPath);

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
        createHelmValuesFile(fileEntry, helmChart, helmValuesMap);
      } else if (!isHelmChartFile(filePath) && fileIsIncluded(fileEntry, projectConfig)) {
        extractResourcesForFileEntry(fileEntry, fileMap, resourceMap);
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
    otherFilePaths: [],
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
