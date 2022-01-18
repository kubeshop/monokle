import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

import {AppConfig} from '@models/appconfig';
import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {HelmChart, HelmValuesFile} from '@models/helm';

import {createFileEntry, extractK8sResourcesFromFile, fileIsExcluded, readFiles} from '@redux/services/fileEntry';

import {getFileStats} from '@utils/files';

/**
 * Checks if the specified fileEntry is a kustomization file
 */

export function getHelmValuesFile(fileEntry: FileEntry, helmValuesMap: HelmValuesMapType) {
  return Object.values(helmValuesMap).find(valuesFile => valuesFile.filePath === fileEntry.filePath);
}

/**
 * Checks if the specified files are a Helm Chart folder
 */

export function isHelmChartFolder(files: string[]) {
  return files.indexOf('Chart.yaml') !== -1 && files.indexOf('values.yaml') !== -1;
}

/**
 * Processes the specified folder as containing a Helm Chart
 */

export function processHelmChartFolder(
  folder: string,
  rootFolder: string,
  files: string[],
  appConfig: AppConfig,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  helmChartMap: HelmChartMapType,
  helmValuesMap: HelmValuesMapType,
  result: string[],
  depth: number
) {
  const helmChart: HelmChart = {
    id: uuidv4(),
    filePath: path.join(folder, 'Chart.yaml').substr(rootFolder.length),
    name: folder.substr(folder.lastIndexOf(path.sep) + 1),
    valueFileIds: [],
  };

  files.forEach(file => {
    const filePath = path.join(folder, file);
    const fileEntryPath = filePath.substr(rootFolder.length);
    const fileEntry = createFileEntry(fileEntryPath);

    if (fileIsExcluded(appConfig, fileEntry)) {
      fileEntry.isExcluded = true;
    } else if (getFileStats(filePath)?.isDirectory()) {
      const folderReadsMaxDepth = appConfig.projectConfig?.folderReadsMaxDepth || appConfig.folderReadsMaxDepth;

      if (depth === folderReadsMaxDepth) {
        log.warn(`[readFiles]: Ignored ${filePath} because max depth was reached.`);
      } else {
        fileEntry.children = readFiles(
          filePath,
          appConfig,
          resourceMap,
          fileMap,
          helmChartMap,
          helmValuesMap,
          depth + 1
        );
      }
    } else if (micromatch.isMatch(file, '*values*.yaml')) {
      const helmValues: HelmValuesFile = {
        id: uuidv4(),
        filePath: fileEntryPath,
        name: file,
        isSelected: false,
        helmChartId: helmChart.id,
      };

      helmValuesMap[helmValues.id] = helmValues;
      helmChart.valueFileIds.push(helmValues.id);
      fileEntry.isSupported = true;
    } else if (appConfig.fileIncludes.some(e => micromatch.isMatch(fileEntry.name, e))) {
      try {
        extractK8sResourcesFromFile(filePath, fileMap).forEach(resource => {
          resourceMap[resource.id] = resource;
        });
      } catch (e) {
        log.warn(`Failed to parse yaml in file ${fileEntry.name}; ${e}`);
      }

      fileEntry.isSupported = true;
    }

    fileMap[fileEntry.filePath] = fileEntry;
    result.push(fileEntry.name);
  });

  helmChartMap[helmChart.id] = helmChart;
}
