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
      thunkAPI.dispatch(previewKustomization(preview.kustomizationId));
    }
    if (preview.type === 'helm') {
      thunkAPI.dispatch(previewHelmValuesFile(preview.valuesFileId));
    }
    if (preview.type === 'helm-config') {
      thunkAPI.dispatch(runPreviewConfiguration({helmConfigId: preview.configId}));
    }
    if (preview.type === 'command') {
      thunkAPI.dispatch(previewSavedCommand(preview.commandId));
    }
  }
);
