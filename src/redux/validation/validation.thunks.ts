import {createAsyncThunk} from '@reduxjs/toolkit';

import {merge} from 'lodash';

import {activeResourceMapSelector} from '@redux/selectors/resourceMapSelectors';

import type {ValidationResponse} from '@monokle/validation';
import {CORE_PLUGINS} from '@shared/constants/validation';
import type {ThunkApi} from '@shared/models/thunk';
import type {LoadValidationResult, ValidationArgs} from '@shared/models/validation';

import {RESOURCE_PARSER, VALIDATOR} from './validation.services';

export const loadValidation = createAsyncThunk<LoadValidationResult, undefined, ThunkApi>(
  'validation/load',
  async (_action, {getState}) => {
    const state = getState().validation;

    // Ensure that these plugins are always get loaded.
    let config = {
      plugins: Object.fromEntries(CORE_PLUGINS.map(p => [p, false])),
    };

    merge(config, state.config);

    await VALIDATOR.preload(config);

    return {
      metadata: VALIDATOR.metadata,
      rules: VALIDATOR.rules,
    };
  }
);

export const validateResources = createAsyncThunk<ValidationResponse | undefined, ValidationArgs | undefined, ThunkApi>(
  'validation/validate',
  async (payload, {getState}) => {
    const incremental = payload?.incremental;
    RESOURCE_PARSER.clear(incremental?.resourceIds);

    // Build references
    // TODO: see about processing resource refs
    // const references = dispatch(processResourceRefs({incremental}));

    // signal.addEventListener('abort', () => {
    //   references.abort();
    // });

    // await references;
    // signal.throwIfAborted();

    const resources = Object.values(activeResourceMapSelector(getState()));
    const response = await VALIDATOR.validate({resources});

    return response;
  }
);
