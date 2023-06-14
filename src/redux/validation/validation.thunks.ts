import {createAsyncThunk} from '@reduxjs/toolkit';

import {merge} from 'lodash';

import {processResourceRefs} from '@redux/parsing/parser.thunks';
import {getIncludedFilePaths} from '@redux/selectors/fileMapGetters';
import {getResourceMapFromState, getResourceMetaMapFromState} from '@redux/selectors/resourceMapGetters';
import {activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ResourceRefType, ValidationResponse} from '@monokle/validation';
import {CORE_PLUGINS} from '@shared/constants/validation';
import {K8sResource, ResourceMeta} from '@shared/models/k8sResource';
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

    await VALIDATOR.loadValidation({config});

    return {
      metadata: VALIDATOR.metadata,
      rules: VALIDATOR.rules,
    };
  }
);

/**
 * Ignore cluster events and unknown resources for now
 */

function shouldResourceBeValidated(resourceMeta: ResourceMeta) {
  if (resourceMeta.storage === 'cluster' && ['Event', 'Namespace'].includes(resourceMeta.kind)) {
    return false;
  }

  if (resourceMeta.kind === 'Pod' && resourceMeta.refs?.some(ref => ref.type === ResourceRefType.IncomingOwner)) {
    return false;
  }

  if (!isDefined(getResourceKindHandler(resourceMeta.kind))) {
    return false;
  }

  return true;
}

let abortController = new AbortController();

export const abortAllRunningValidation = () => {
  abortController.abort();
  abortController = new AbortController();
};

export const validateResources = createAsyncThunk<ValidationResponse | undefined, ValidationArgs | undefined, ThunkApi>(
  'validation/validate',
  async (payload, {getState, dispatch, signal, rejectWithValue}) => {
    let resources: K8sResource[] = [];
    let files: undefined | string[];

    if (payload?.type === 'full') {
      let resourceStorage = payload.resourceStorage || activeResourceStorageSelector(getState());

      resources = Object.values(
        getResourceMapFromState(getState(), resourceStorage, shouldResourceBeValidated) || {}
      ).filter(isDefined);

      // mix in transient resources created in the resourceStorage
      resources = resources.concat(
        Object.values(getResourceMapFromState(getState(), 'transient'))
          .filter(isDefined)
          // @ts-ignore
          .filter(r => r.origin.createdIn === resourceStorage)
      );

      if (resourceStorage === 'local') {
        files = getIncludedFilePaths(getState().main.fileMap);
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
        const resourceMap = getResourceMapFromState(getState(), storage, shouldResourceBeValidated);
        resources = resources.concat(Object.values(resourceMap).filter(isDefined));
      });

      if (affectedStorages.has('local')) {
        files = getIncludedFilePaths(getState().main.fileMap);
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

    abortController.signal.addEventListener('abort', () => {
      references.abort();
    });

    let resourcesWithRefs: ValidationResource[] = [];
    try {
      resourcesWithRefs = await references.unwrap();
    } catch (e) {
      return rejectWithValue(e);
    }
    signal.throwIfAborted();
    abortController.signal.throwIfAborted();

    // TODO: could the active resource map change while the validation is running? before we get the refs?
    try {
      const {response} = await VALIDATOR.runValidation({
        resources: resourcesWithRefs,
        incremental: incrementalResourceIds ? {resourceIds: incrementalResourceIds} : undefined,
      });

      signal.throwIfAborted();
      abortController.signal.throwIfAborted();

      return response;
    } catch (e) {
      rejectWithValue(e);
    }
  }
);
