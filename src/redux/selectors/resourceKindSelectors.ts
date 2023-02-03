import {createSelector} from 'reselect';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {RootState} from '@shared/models/rootState';

export const registeredKindHandlersSelector = createSelector(
  (state: RootState) => state.main.registeredKindHandlers,
  registeredKindHandlers => {
    return registeredKindHandlers
      .map(kind => getResourceKindHandler(kind))
      .filter((handler): handler is ResourceKindHandler => handler !== undefined);
  }
);

export const knownResourceKindsSelector = createSelector(
  (state: RootState) => state.main.registeredKindHandlers,
  registeredKindHandlers => {
    return registeredKindHandlers
      .map(kind => getResourceKindHandler(kind))
      .filter((handler): handler is ResourceKindHandler => handler !== undefined)
      .map(handler => handler.kind);
  }
);
