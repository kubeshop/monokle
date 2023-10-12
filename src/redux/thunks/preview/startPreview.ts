import {createAsyncThunk} from '@reduxjs/toolkit';

import {clearPreviewAndSelectionHistory} from '@redux/reducers/main';

import {AppDispatch} from '@shared/models/appDispatch';
import {AnyPreview} from '@shared/models/preview';

import {runPreviewConfiguration} from '../runPreviewConfiguration';
import {previewHelmValuesFile} from './previewHelmValuesFile';
import {previewKustomization} from './previewKustomization';
import {previewSavedCommand} from './previewSavedCommand';

export const startPreview = createAsyncThunk<void, AnyPreview, {dispatch: AppDispatch}>(
  'main/startPreview',
  async (preview, thunkAPI) => {
    thunkAPI.dispatch(clearPreviewAndSelectionHistory());

    if (preview.type === 'kustomize') {
      await thunkAPI.dispatch(previewKustomization(preview.kustomizationId)).unwrap();
    }
    if (preview.type === 'helm') {
      await thunkAPI.dispatch(previewHelmValuesFile(preview.valuesFileId)).unwrap();
    }
    if (preview.type === 'helm-config') {
      await thunkAPI.dispatch(runPreviewConfiguration({helmConfigId: preview.configId})).unwrap();
    }
    if (preview.type === 'command') {
      await thunkAPI.dispatch(previewSavedCommand(preview.commandId)).unwrap();
    }
  }
);
