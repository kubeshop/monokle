import {createAsyncThunk} from '@reduxjs/toolkit';

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

    filePaths.forEach((filePath: string) => {
      let fileEntry = getFileEntryForAbsolutePath(filePath, state.main.fileMap);
      if (fileEntry) {
        reloadFile(filePath, fileEntry, state.main, projectConfig, userDataDir);
      } else if (!projectConfig.scanExcludes || !micromatch.any(filePath, projectConfig.scanExcludes)) {
        addPath(filePath, state.main, projectConfig, userDataDir);
      }
    });
  }
);
