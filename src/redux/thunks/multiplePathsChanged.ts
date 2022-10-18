import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import micromatch from 'micromatch';

import {RootState} from '@models/rootstate';

import {setChangedFiles, setGitLoading} from '@redux/git';
import {currentConfigSelector} from '@redux/selectors';
import {addPath, getFileEntryForAbsolutePath, reloadFile} from '@redux/services/fileEntry';

import {promiseFromIpcRenderer} from '@utils/promises';

export const multiplePathsChanged = createAsyncThunk(
  'main/multiplePathsChanged',
  async (filePaths: Array<string>, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const changedFiles = state.git.changedFiles;
    const userDataDir = String(state.config.userDataDir);
    const projectRootFolder = state.config.selectedProjectRootFolder;

    let unstageFilesPaths: string[] = [];

    const nextMainState = createNextState(state.main, mainState => {
      filePaths.forEach(filePath => {
        let fileEntry = getFileEntryForAbsolutePath(filePath, mainState.fileMap);
        if (fileEntry) {
          reloadFile(filePath, fileEntry, mainState, projectConfig, userDataDir);
        } else if (!projectConfig.scanExcludes || !micromatch.any(filePath, projectConfig.scanExcludes)) {
          addPath(filePath, mainState, projectConfig, userDataDir);
        }

        if (changedFiles.length) {
          const foundFile = changedFiles.find(file => file.path === fileEntry?.filePath);
          if (foundFile) {
            unstageFilesPaths.push(foundFile.fullGitPath);
          }
        }
      });
    });

    if (state.git.repo) {
      if (!state.git.loading) {
        thunkAPI.dispatch(setGitLoading(true));
      }

      if (unstageFilesPaths.length) {
        promiseFromIpcRenderer('git.unstageFiles', 'git.unstageFiles.result', {
          localPath: projectRootFolder,
          filePaths: unstageFilesPaths,
        });
      } else {
        promiseFromIpcRenderer('git.getChangedFiles', 'git.getChangedFiles.result', {
          localPath: projectRootFolder,
          fileMap: nextMainState.fileMap,
        }).then(result => {
          thunkAPI.dispatch(setChangedFiles(result));
          thunkAPI.dispatch(setGitLoading(false));
        });
      }
    }

    return nextMainState;
  }
);
