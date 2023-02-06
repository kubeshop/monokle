import {createAsyncThunk} from '@reduxjs/toolkit';

import {merge} from 'lodash';

import {activeResourceMapSelector} from '@redux/selectors/resourceMapSelectors';

import {Incremental, ValidationResponse, processRefs} from '@monokle/validation';
import {CORE_PLUGINS} from '@shared/constants/validation';
import {K8sResource} from '@shared/models/k8sResource';
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

    await VALIDATOR.preload(config);

    return {
      metadata: VALIDATOR.metadata,
      rules: VALIDATOR.rules,
    };
  }
);

export const validateResources = createAsyncThunk<ValidationResponse | undefined, ValidationArgs | undefined, ThunkApi>(
  'validation/validate',
  async (payload, {getState, dispatch, signal}) => {
    const incremental = payload?.incremental;
    RESOURCE_PARSER.clear(incremental?.resourceIds);
    const activeResources = Object.values(activeResourceMapSelector(getState()));

    // Build references
    const references = dispatch(processResourceRefs({resources: activeResources, incremental}));
    signal.addEventListener('abort', () => {
      references.abort();
    });
    await references;
    signal.throwIfAborted();

    const transformedResources = activeResources.map(transformResourceForValidation).filter(isDefined);

    // TODO: could the active resource map change while the validation is running? before we get the refs?
    const response = await VALIDATOR.validate({
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
  // if (!isLocalResource(r)) {
  //   return undefined;
  // }
  const cast = r as K8sResource<'local'>;
  return {
    ...r,
    filePath: cast.origin.filePath,
    fileOffset: cast.origin.fileOffset,
    fileId: cast.origin.filePath,
    content: r.object,
  };
}

export const processResourceRefs = createAsyncThunk<ValidationResource[], ProcessArgs, ThunkApi>(
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
