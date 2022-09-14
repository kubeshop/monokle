import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import micromatch from 'micromatch';

import {GitRepo} from '@models/git';
import {RootState} from '@models/rootstate';

import {setChangedFiles, setCurrentBranch, setRepo} from '@redux/git';
import {currentConfigSelector} from '@redux/selectors';
import {addPath, getFileEntryForAbsolutePath, reloadFile} from '@redux/services/fileEntry';

import {promiseFromIpcRenderer} from '@utils/promises';

export const multiplePathsChanged = createAsyncThunk(
  'main/multiplePathsChanged',
  async (filePaths: Array<string>, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const userDataDir = String(state.config.userDataDir);
    const projectRootFolderPath = state.config.selectedProjectRootFolder;
    const gitRepo = state.git.repo;

    const nextMainState = createNextState(state.main, mainState => {
      filePaths.forEach((filePath: string) => {
        let fileEntry = getFileEntryForAbsolutePath(filePath, mainState.fileMap);
        if (fileEntry) {
          reloadFile(filePath, fileEntry, mainState, projectConfig, userDataDir);
        } else if (!projectConfig.scanExcludes || !micromatch.any(filePath, projectConfig.scanExcludes)) {
          addPath(filePath, mainState, projectConfig, userDataDir);
        }
      });
    });

    if (gitRepo) {
      promiseFromIpcRenderer<GitRepo>('git.fetchGitRepo', 'git.fetchGitRepo.result', projectRootFolderPath).then(
        result => {
          thunkAPI.dispatch(setRepo(result));
          thunkAPI.dispatch(setCurrentBranch(result.currentBranch));
        }
      );

      promiseFromIpcRenderer('git.getChangedFiles', 'git.getChangedFiles.result', {
        localPath: projectRootFolderPath,
        fileMap: nextMainState.fileMap,
      }).then(result => {
        thunkAPI.dispatch(setChangedFiles(result));
      });
    }

    return nextMainState;
  }
);
