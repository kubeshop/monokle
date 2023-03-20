import {createAsyncThunk} from '@reduxjs/toolkit';

import {Incremental} from '@monokle/validation';
import {K8sResource} from '@shared/models/k8sResource';
import {ThunkApi} from '@shared/models/thunk';
import {ValidationResource} from '@shared/models/validation';

import {RESOURCE_PARSER} from './resourceParser';

type ProcessArgs = {
  resources: K8sResource[];
  incremental?: Incremental;
};

export const processResourceRefs = createAsyncThunk<ValidationResource[], ProcessArgs, ThunkApi>(
  'references/process',
  async (payload, {signal}) => {
    const {validationResources} = await RESOURCE_PARSER.processRefs({
      resources: payload.resources,
      incremental: payload.incremental,
    });
    if (signal.aborted) return [];
    signal.throwIfAborted();

    return validationResources;
  }
);
