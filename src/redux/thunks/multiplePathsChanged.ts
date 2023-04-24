import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import micromatch from 'micromatch';

import {currentConfigSelector} from '@redux/appConfig';
import {setChangedFiles, setGitLoading} from '@redux/git';
import {getChangedFiles} from '@redux/git/git.ipc';
import {addPath, getFileEntryForAbsolutePath, reloadFile} from '@redux/services/fileEntry';

import {AppState} from '@shared/models/appState';
import {FileSideEffect} from '@shared/models/fileEntry';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

export const multiplePathsChanged = createAsyncThunk<
  {
    nextMainState: AppState;
    affectedResourceIdentifiers: ResourceIdentifier[];
    // the paths of the existing files that have been modified
    reloadedFilePaths: string[];
  },
  Array<string>
>('main/multiplePathsChanged', async (filePaths, thunkAPI: {getState: Function; dispatch: Function}) => {
  const state: RootState = thunkAPI.getState();
  const projectConfig = currentConfigSelector(state);
  const projectRootFolder = state.config.selectedProjectRootFolder;

  const reloadedFilePaths: string[] = [];

  const fileSideEffect: FileSideEffect = {
    affectedResourceIds: [],
  };

  const nextMainState = createNextState(state.main, mainState => {
    filePaths.forEach(filePath => {
      let fileEntry = getFileEntryForAbsolutePath(filePath, mainState.fileMap);
      if (fileEntry) {
        reloadFile(filePath, fileEntry, mainState, projectConfig, fileSideEffect);
        reloadedFilePaths.push(filePath);
      } else if (!projectConfig.scanExcludes || !micromatch.any(filePath, projectConfig.scanExcludes)) {
        addPath(filePath, mainState, projectConfig, fileSideEffect);
      }
    });
  });

  if (state.git.repo) {
    if (!state.git.loading) {
      thunkAPI.dispatch(setGitLoading(true));
    }

    getChangedFiles({localPath: projectRootFolder || '', fileMap: thunkAPI.getState().main.fileMap})
      .then(changedFiles => {
        thunkAPI.dispatch(setChangedFiles(changedFiles));
        thunkAPI.dispatch(setGitLoading(false));
      })
      .catch(() => {
        thunkAPI.dispatch(setGitLoading(false));
      });
  }

  return {
    nextMainState,
    affectedResourceIdentifiers: fileSideEffect.affectedResourceIds.map(id => ({id, storage: 'local'})),
    reloadedFilePaths,
  };
});
