import {TaskAbortError, isAnyOf} from '@reduxjs/toolkit';

import {AppListenerFn} from '@redux/listeners/base';
import {setAlert} from '@redux/reducers/alert';
import {compareResources} from '@redux/services/compare/compareResources';
import {fetchResources} from '@redux/services/compare/fetchResources';
import {createResourceFilters, filterComparisons} from '@redux/services/compare/filterComparisons';

import {errorAlert} from '@utils/alert';
import {errorMsg} from '@utils/error';

import {selectCompareStatus, selectResourceSet} from './selectors';
import {
  compareToggled,
  filterUpdated,
  namespaceUpdated,
  operationUpdated,
  resourceSetCleared,
  resourceSetCompared,
  resourceSetFetchFailed,
  resourceSetFetchPending,
  resourceSetFetched,
  resourceSetFilterPending,
  resourceSetFiltered,
  resourceSetRefreshed,
  resourceSetSelected,
  searchUpdated,
} from './slice';
import {CompareSide} from './state';
import {isCompleteResourceSet} from './utils';

export const resourceFetchListener =
  (side: CompareSide): AppListenerFn =>
  listen => {
    listen({
      predicate: (action, state) => {
        const resourceSetUpdated = isAnyOf(
          compareToggled,
          resourceSetSelected,
          resourceSetRefreshed,
          resourceSetCleared
        );
        if (!resourceSetUpdated(action)) return false;

        const actionSide = compareToggled.match(action) ? side : action.payload.side;
        if (actionSide !== side) return false;

        const resourceSet = selectResourceSet(state.compare, side);
        if (!isCompleteResourceSet(resourceSet)) return false;

        return true;
      },
      effect: async (action, {dispatch, getState, cancelActiveListeners}) => {
        try {
          cancelActiveListeners();
          if (resourceSetCleared.match(action)) return;
          dispatch(resourceSetFetchPending({side}));

          const state = getState();
          const options = selectResourceSet(state.compare, side);
          if (!isCompleteResourceSet(options)) return;

          const resources = await fetchResources(state, options);

          dispatch(resourceSetFetched({side, resources}));
        } catch (err) {
          if (err instanceof TaskAbortError) return;
          const reason = errorMsg(err);
          dispatch(resourceSetFetchFailed({side, reason}));
          dispatch(setAlert(errorAlert('Cannot retrieve resources', reason)));
        }
      },
    });
  };

export const compareListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(resourceSetFetched, operationUpdated, namespaceUpdated),
    effect: async (_action, {dispatch, getState}) => {
      const status = selectCompareStatus(getState().compare);
      const current = getState().compare.current;
      const {left, right, view} = current;

      if (status !== 'comparing' || !left || !right) {
        return;
      }

      const comparisons = compareResources(left.resources, right.resources, {
        operation: view.operation ?? 'union',
        defaultNamespace: view.namespace,
      });

      dispatch(resourceSetCompared({comparisons}));
    },
  });
};

export const filterListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(resourceSetCompared, filterUpdated, searchUpdated),
    effect: async (_, {dispatch, getState, cancelActiveListeners, delay}) => {
      cancelActiveListeners();
      dispatch(resourceSetFilterPending());
      await delay(3);

      const {search, comparison, view} = getState().compare.current;
      const allComparisons = comparison?.comparisons ?? [];
      const filters = createResourceFilters({search, ...view.filter});
      const comparisons = filterComparisons(allComparisons, filters);

      dispatch(resourceSetFiltered({comparisons}));
    },
  });
};
