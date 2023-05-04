import {createAsyncThunk} from '@reduxjs/toolkit';

import {merge} from 'lodash';

import {processResourceRefs} from '@redux/parsing/parser.thunks';
import {getResourceMapFromState, getResourceMetaMapFromState} from '@redux/selectors/resourceMapGetters';
import {activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';

import {ValidationResponse} from '@monokle/validation';
import {CORE_PLUGINS} from '@shared/constants/validation';
import {K8sResource} from '@shared/models/k8sResource';
import type {ThunkApi} from '@shared/models/thunk';
import type {LoadValidationResult, ValidationArgs, ValidationResource} from '@shared/models/validation';
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

    // @ts-ignore
    if (config && config['rules']) {
      // @ts-ignore
      config.rules['resource-links/no-missing-optional-links'] = 'warn';
    }

    await VALIDATOR.loadValidation({config});

    return {
      metadata: VALIDATOR.metadata,
      rules: VALIDATOR.rules,
    };
  }
);

export const validateResources = createAsyncThunk<ValidationResponse | undefined, ValidationArgs | undefined, ThunkApi>(
  'validation/validate',
  async (payload, {getState, dispatch, signal, rejectWithValue}) => {
    let resources: K8sResource[] = [];
    let files: undefined | string[];

    if (payload?.type === 'full') {
      let resourceStorage = payload.resourceStorage || activeResourceStorageSelector(getState());
      resources = Object.values(getResourceMapFromState(getState(), resourceStorage) || {}).filter(isDefined);

      // mix in transient resources created in the resourceStorage
      resources = resources.concat(
        Object.values(getResourceMapFromState(getState(), 'transient'))
          .filter(isDefined)
          // @ts-ignore
          .filter(r => r.origin.createdIn === resourceStorage)
      );

      if (resourceStorage === 'local') {
        files = Object.keys(getState().main.fileMap);
      }
    } else if (payload?.type === 'incremental') {
      const affectedStorages = new Set(payload.resourceIdentifiers.map(r => r.storage));

      // if any of the changed resources are transient we need to make sure the storages that these were created in are included
      if (affectedStorages.has('transient')) {
        let transientMeta = getResourceMetaMapFromState(getState(), 'transient');
        payload.resourceIdentifiers
          .filter(r => r.storage === 'transient')
          .map(r => transientMeta[r.id].origin.createdIn)
          .filter(isDefined)
          .forEach(storage => affectedStorages.add(storage));
      } else {
        // if no transient resources are affected mix in transient resources are included since
        // the affected resources could be referring to them
        affectedStorages.add('transient');
      }

      affectedStorages.forEach(storage => {
        const resourceMap = getResourceMapFromState(getState(), storage);
        resources = resources.concat(Object.values(resourceMap).filter(isDefined));
      });

      if (affectedStorages.has('local')) {
        files = Object.keys(getState().main.fileMap);
      }
    }

    const incrementalResourceIds =
      payload?.type === 'incremental' ? payload.resourceIdentifiers.map(r => r.id) : undefined;

    // Build references
    const references = dispatch(
      processResourceRefs({
        resources,
        incremental: incrementalResourceIds ? {resourceIds: incrementalResourceIds} : undefined,
        files,
      })
    );

    signal.addEventListener('abort', () => {
      references.abort();
    });

    let resourcesWithRefs: ValidationResource[] = [];
    try {
      resourcesWithRefs = await references.unwrap();
    } catch (e) {
      return rejectWithValue(e);
    }
    signal.throwIfAborted();

    // TODO: could the active resource map change while the validation is running? before we get the refs?
    try {
      const {response} = await VALIDATOR.runValidation({
        resources: resourcesWithRefs,
        incremental: incrementalResourceIds ? {resourceIds: incrementalResourceIds} : undefined,
      });
      return response;
    } catch (e) {
      rejectWithValue(e);
    }
  }
);
