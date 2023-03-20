import {createAsyncThunk} from '@reduxjs/toolkit';

import {merge} from 'lodash';

import {processResourceRefs} from '@redux/parsing/parser.thunks';
import {RESOURCE_PARSER} from '@redux/parsing/resourceParser';
import {getActiveResourceMapFromState, getResourceMapFromState} from '@redux/selectors/resourceMapGetters';

import {transformResourceForValidation} from '@utils/resources';

import {ValidationResponse} from '@monokle/validation';
import {CORE_PLUGINS} from '@shared/constants/validation';
import {K8sResource} from '@shared/models/k8sResource';
import type {ThunkApi} from '@shared/models/thunk';
import type {LoadValidationResult, ValidationArgs} from '@shared/models/validation';
import electronStore from '@shared/utils/electronStore';
import {isDefined} from '@shared/utils/filter';

import {VALIDATOR} from './validator';

export const loadValidation = createAsyncThunk<LoadValidationResult, undefined, ThunkApi>(
  'validation/load',
  async (_action, {getState}) => {
    const state = getState().validation;

    // Ensure that these plugins are always get loaded.
    let config = {
      plugins: Object.fromEntries(CORE_PLUGINS.map(p => [p, false])),
    };

    merge(config, state.config);
    electronStore.set('validation.config', config);

    await VALIDATOR.loadValidation({config});

    return {
      metadata: VALIDATOR.metadata,
      rules: VALIDATOR.rules,
    };
  }
);

export const validateResources = createAsyncThunk<ValidationResponse | undefined, ValidationArgs | undefined, ThunkApi>(
  'validation/validate',
  async (payload, {getState, dispatch, signal}) => {
    let resources: K8sResource[] = [];

    if (payload?.type === 'full') {
      const resourceStorage = payload.resourceStorage;
      if (resourceStorage) {
        resources = Object.values(getResourceMapFromState(getState(), resourceStorage) || {}).filter(isDefined);
      } else {
        resources = Object.values(getActiveResourceMapFromState(getState())).filter(isDefined);
      }
    } else if (payload?.type === 'incremental') {
      const affectedStorages = new Set(payload.resourceIdentifiers.map(r => r.storage));
      affectedStorages.forEach(storage => {
        const resourceMap = getResourceMapFromState(getState(), storage);
        resources = resources.concat(Object.values(resourceMap).filter(isDefined));
      });
    }

    const incrementalResourceIds =
      payload?.type === 'incremental' ? payload.resourceIdentifiers.map(r => r.id) : undefined;
    RESOURCE_PARSER.clear(incrementalResourceIds);

    // Build references
    const references = dispatch(
      processResourceRefs({
        resources: resources.map(transformResourceForValidation).filter(isDefined),
        incremental: incrementalResourceIds ? {resourceIds: incrementalResourceIds} : undefined,
      })
    );

    signal.addEventListener('abort', () => {
      references.abort();
    });
    const resourcesWithRefs = await references.unwrap();
    signal.throwIfAborted();

    // TODO: could the active resource map change while the validation is running? before we get the refs?
    const {response} = await VALIDATOR.runValidation({
      resources: resourcesWithRefs,
      incremental: incrementalResourceIds ? {resourceIds: incrementalResourceIds} : undefined,
    });

    return response;
  }
);
