import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs/promises';
import log from 'loglevel';

import {getAbsoluteFilePath} from '@redux/services/fileEntry';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const readResourceFile = createAsyncThunk<string | undefined, string, {dispatch: AppDispatch; state: RootState}>(
  'main/readResourceFile',
  async (selectedFilePath, thunkAPI) => {
    const fileMap = thunkAPI.getState().main.fileMap;

    try {
      const absoluteFilePath = getAbsoluteFilePath(selectedFilePath, fileMap);
      const fileContent = await fs.readFile(absoluteFilePath, 'utf8');
      return fileContent;
    } catch (e: any) {
      log.error(`Failed to read file [${selectedFilePath}]`, e);
    }
  }
);
