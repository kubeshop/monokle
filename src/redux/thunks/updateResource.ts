import {createAsyncThunk, original} from '@reduxjs/toolkit';

import {RootState} from '@models/rootstate';

import {UpdateResourcePayload, mainSlice} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {getK8sVersion} from '@redux/services/projectConfig';

export const updateResource = createAsyncThunk(
  'main/updateResource',
  async (payload: UpdateResourcePayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const schemaVersion = getK8sVersion(projectConfig);
    const userDataDir = String(state.config.userDataDir);

    try {
      thunkAPI.dispatch(
        mainSlice.actions.updateResourceSubAction({userDataDir, schemaVersion, parentPayload: payload})
      );
    } catch (error) {
      return original(error);
    }
  }
);
