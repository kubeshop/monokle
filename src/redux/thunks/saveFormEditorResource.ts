import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs/promises';
import log from 'loglevel';

import {setAutosavingError, setAutosavingStatus} from '@redux/reducers/main';
import {selectedFilePathSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {mergeManifests} from '@redux/services/manifest-utils';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const saveFormEditorResource = createAsyncThunk<void, string, {dispatch: AppDispatch; state: RootState}>(
  'main/saveResourceFileChanges',
  async (formString, thunkAPI) => {
    const fileMap = thunkAPI.getState().main.fileMap;

    const selectedFilePath = selectedFilePathSelector(thunkAPI.getState());

    if (!selectedFilePath) {
      return;
    }
    try {
      const absoluteFilePath = getAbsoluteFilePath(selectedFilePath, fileMap);
      const fileContent = await fs.readFile(absoluteFilePath, 'utf8');
      const content = mergeManifests(fileContent, formString);
      const isChanged = content.trim() !== fileContent.trim();

      if (isChanged) {
        await fs.writeFile(absoluteFilePath, content);
      }
    } catch (e: any) {
      const {message, stack} = e;

      thunkAPI.dispatch(setAutosavingError({message, stack}));
      log.error(`Failed to update file [${selectedFilePath}]`, e);
    } finally {
      thunkAPI.dispatch(setAutosavingStatus(false));
    }
  }
);
