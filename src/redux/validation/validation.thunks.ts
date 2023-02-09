import {createAsyncThunk} from '@reduxjs/toolkit';

import {merge} from 'lodash';

import {activeResourceMapSelector, resourceMapSelector} from '@redux/selectors/resourceMapSelectors';
import {resourceSelector} from '@redux/selectors/resourceSelectors';

import {Incremental, ValidationResponse, processRefs} from '@monokle/validation';
import {CORE_PLUGINS} from '@shared/constants/validation';
import {
  K8sResource,
  isClusterResource,
  isLocalResource,
  isPreviewResource,
  isTransientResource,
} from '@shared/models/k8sResource';
import type {ThunkApi} from '@shared/models/thunk';
import type {LoadValidationResult, ValidationArgs} from '@shared/models/validation';
import electronStore from '@shared/utils/electronStore';
import {isDefined} from '@shared/utils/filter';

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
        resources = Object.values(resourceMapSelector(getState(), resourceStorage) || {}).filter(isDefined);
      } else {
        resources = Object.values(activeResourceMapSelector(getState())).filter(isDefined);
      }
    } else if (payload?.type === 'incremental') {
      resources = payload.resourceIdentifiers
        .map(identifier => resourceSelector(getState(), identifier))
        .filter(isDefined);
    }

    const incrementalResourceIds =
      payload?.type === 'incremental' ? payload.resourceIdentifiers.map(r => r.id) : undefined;
    RESOURCE_PARSER.clear(incrementalResourceIds);

    // Build references
    const references = dispatch(
      processResourceRefs({
        resources,
        incremental: incrementalResourceIds ? {resourceIds: incrementalResourceIds} : undefined,
      })
    );
    signal.addEventListener('abort', () => {
      references.abort();
    });
    await references;
    signal.throwIfAborted();

    // TODO: do we have to fetch the resources again after processing the refs?
    const transformedResources = resources.map(transformResourceForValidation).filter(isDefined);

    // TODO: could the active resource map change while the validation is running? before we get the refs?
    const {response} = await VALIDATOR.runValidation({
      resources: transformedResources,
    });

    return response;
  }
);

type ProcessArgs = {
  resources: K8sResource[];
  incremental?: Incremental;
};

// export const processResourceRefs = async (
//   resourceState: EntityState<Resource>,
//   incremental?: Incremental
// ): Promise<Resource[]> => {
//   if (worker) {
//     const resourceList = resourcesAdaptor
//       .getSelectors()
//       .selectAll(resourceState);

//     // would be nice if this would not mutate the resource objects but rather return a map of all the refs
//     const processedResources: Resource[] = await worker.processRefs(
//       resourceList,
//       incremental
//     );

//     return processedResources;
//   }
//   const resources = Object.values(resourceState.entities).filter(isDefined);
//   return processRefs(resources, RESOURCE_PARSER, incremental);
// };

type ValidationResource = K8sResource & {filePath: string; fileOffset: number; fileId: string; content: any};

function transformResourceForValidation(r: K8sResource): ValidationResource | undefined {
  let filePath = '';
  let fileOffset = 0;

  if (isLocalResource(r)) {
    filePath = r.origin.filePath;
    fileOffset = r.origin.fileOffset;
  } else if (isClusterResource(r)) {
    filePath = r.origin.context;
    fileOffset = 0;
  } else if (isPreviewResource(r)) {
    filePath = r.origin.preview.type;
    fileOffset = 0;
  } else if (isTransientResource(r)) {
    filePath = 'transient';
    fileOffset = 0;
  }

  return {
    ...r,
    // id: stableStringify({id: r.id, storage: r.storage}), // TODO: do we need this?
    filePath,
    fileOffset,
    fileId: filePath,
    content: r.object,
  };
}

// TODO: fix incremental processing of refs
export const processResourceRefs = createAsyncThunk<K8sResource[], ProcessArgs, ThunkApi>(
  'references/process',
  async (payload, {signal}) => {
    const transformedResources = payload.resources.map(transformResourceForValidation).filter(isDefined);
    const processedResources = processRefs(
      transformedResources,
      RESOURCE_PARSER,
      payload?.incremental
    ) as ValidationResource[];
    if (signal.aborted) return [];
    signal.throwIfAborted();
    return processedResources;
  }
);
