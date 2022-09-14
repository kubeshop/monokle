import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import micromatch from 'micromatch';

import {RootState} from '@models/rootstate';

import {currentConfigSelector} from '@redux/selectors';
import {addPath, getFileEntryForAbsolutePath, reloadFile} from '@redux/services/fileEntry';

export const multiplePathsChanged = createAsyncThunk(
  'main/multiplePathsChanged',
  async (filePaths: Array<string>, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const userDataDir = String(state.config.userDataDir);

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

    return nextMainState;
  }
);
