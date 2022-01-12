import {FSWatcher, watch} from 'chokidar';
import {readFileSync} from 'fs';
import _ from 'lodash';
import {sep} from 'path';

import {ProjectConfig} from '@models/appconfig';

import {updateProjectConfig} from '@redux/reducers/appConfig';
import {AppDispatch} from '@redux/store';

let watcher: FSWatcher;

/**
 * Creates a monitor for the specified folder and dispatches folder events using the specified dispatch
 */

export function monitorProjectConfigFile(
  dispatch: AppDispatch,
  currentProjectConfig: ProjectConfig,
  filePath?: string | null
) {
  if (!filePath && watcher) {
    watcher.close();
    return;
  }
  if (watcher) {
    watcher.close();
  }

  const absolutePath = `${filePath}${sep}.monokle`;

  watcher = watch(absolutePath, {
    persistent: true,
    usePolling: true,
    interval: 1000,
  });

  watcher
    .on('add', () => {
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, currentProjectConfig, dispatch);
    })
    .on('change', () => {
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, currentProjectConfig, dispatch);
    })
    .on('unlink', () => {
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, currentProjectConfig, dispatch);
    });

  watcher
    /* eslint-disable no-console */
    .on('error', error => console.log(`Watcher error: ${error}`));
}

const readApplicationConfigFileAndUpdateProjectSettings = (
  absolutePath: string,
  currentProjectConfig: ProjectConfig,
  dispatch: AppDispatch
) => {
  try {
    const {settings, scanExcludes, fileIncludes, folderReadsMaxDepth}: ProjectConfig = JSON.parse(
      readFileSync(absolutePath, 'utf8')
    );
    const projectConfig: ProjectConfig = {};
    projectConfig.settings = {
      helmPreviewMode: settings ? settings.helmPreviewMode : undefined,
      kustomizeCommand: settings ? settings.kustomizeCommand : undefined,
      hideExcludedFilesInFileExplorer: settings ? settings.hideExcludedFilesInFileExplorer : undefined,
      isClusterSelectorVisible: settings ? settings.isClusterSelectorVisible : undefined,
    };

    projectConfig.scanExcludes = scanExcludes;
    projectConfig.fileIncludes = fileIncludes;
    projectConfig.folderReadsMaxDepth = folderReadsMaxDepth;

    if (!_.isEqual(projectConfig, currentProjectConfig)) {
      dispatch(updateProjectConfig(projectConfig));
    }
  } catch (error) {
    dispatch(updateProjectConfig(null));
  }
};
