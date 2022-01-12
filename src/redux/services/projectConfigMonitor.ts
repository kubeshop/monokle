import {FSWatcher, watch} from 'chokidar';
import {readFileSync} from 'fs';
import {sep} from 'path';

import {ProjectConfig} from '@models/appconfig';

import {updateProjectConfig} from '@redux/reducers/appConfig';
import {AppDispatch} from '@redux/store';

let watcher: FSWatcher;

/**
 * Creates a monitor for the specified folder and dispatches folder events using the specified dispatch
 */

export function monitorProjectConfigFile(dispatch: AppDispatch, filePath?: string | null) {
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
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, dispatch);
    })
    .on('change', () => {
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, dispatch);
    })
    .on('unlink', () => {
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, dispatch);
    });

  watcher
    /* eslint-disable no-console */
    .on('error', error => console.log(`Watcher error: ${error}`));
}

const readApplicationConfigFileAndUpdateProjectSettings = (absolutePath: string, dispatch: AppDispatch) => {
  try {
    const {settings, scanExcludes, fileIncludes, folderReadsMaxDepth}: ProjectConfig = JSON.parse(
      readFileSync(absolutePath, 'utf8')
    );
    const projectConfig: ProjectConfig = {};
    projectConfig.settings = settings
      ? {
          helmPreviewMode: settings.helmPreviewMode,
          kustomizeCommand: settings.kustomizeCommand,
          hideExcludedFilesInFileExplorer: settings.hideExcludedFilesInFileExplorer,
          isClusterSelectorVisible: settings.isClusterSelectorVisible,
        }
      : undefined;

    projectConfig.scanExcludes = scanExcludes;
    projectConfig.fileIncludes = fileIncludes;
    projectConfig.folderReadsMaxDepth = folderReadsMaxDepth;

    dispatch(updateProjectConfig(projectConfig));
  } catch (error) {
    dispatch(updateProjectConfig(null));
  }
};
