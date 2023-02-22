import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import log from 'loglevel';
import micromatch from 'micromatch';

import {currentConfigSelector} from '@redux/appConfig';
import {setChangedFiles, setGitLoading} from '@redux/git';
import {addPath, getFileEntryForAbsolutePath, reloadFile} from '@redux/services/fileEntry';

import {getFileStats} from '@utils/files';
import {promiseFromIpcRenderer} from '@utils/promises';

import {AppState} from '@shared/models/appState';
import {FileSideEffect} from '@shared/models/fileEntry';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

export const multiplePathsAdded = createAsyncThunk<
  {nextMainState: AppState; affectedResourceIdentifiers: ResourceIdentifier[]},
  Array<string>
>('main/multiplePathsAdded', async (filePaths, thunkAPI: {getState: Function; dispatch: Function}) => {
  const state: RootState = thunkAPI.getState();
  const projectConfig = currentConfigSelector(state);
  const projectRootFolder = state.config.selectedProjectRootFolder;

  const fileSideEffect: FileSideEffect = {
    affectedResourceIds: [],
  };

  const nextMainState = createNextState(state.main, mainState => {
    filePaths.forEach((filePath: string) => {
      let fileEntry = getFileEntryForAbsolutePath(filePath, mainState.fileMap);
      if (fileEntry) {
        if (getFileStats(filePath)?.isDirectory() === false) {
          log.info(`added file ${filePath} already exists - updating`);
          reloadFile(filePath, fileEntry, mainState, projectConfig, fileSideEffect);
        }
      } else if (!projectConfig.scanExcludes || !micromatch.any(filePath, projectConfig.scanExcludes)) {
        addPath(filePath, mainState, projectConfig, fileSideEffect);
      }
    });
  });

  if (state.git.repo) {
    if (!state.git.loading) {
      thunkAPI.dispatch(setGitLoading(true));
    }

    promiseFromIpcRenderer('git.getChangedFiles', 'git.getChangedFiles.result', {
      localPath: projectRootFolder,
      fileMap: nextMainState.fileMap,
    }).then(result => {
      thunkAPI.dispatch(setChangedFiles(result));
      thunkAPI.dispatch(setGitLoading(false));
    });
  }

  return {
    nextMainState,
    affectedResourceIdentifiers: fileSideEffect.affectedResourceIds.map(id => ({id, storage: 'local'})),
  };
});
