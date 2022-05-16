import {PayloadAction, TaskAbortError, createSelector, createSlice, isAnyOf} from '@reduxjs/toolkit';

import {WritableDraft} from 'immer/dist/internal';
import {groupBy} from 'lodash';
import log from 'loglevel';

import {K8sResource} from '@models/k8sresource';

import {AppListenerFn} from '@redux/listeners/base';
import {compareResources} from '@redux/services/compare/compareResources';
import {fetchResources} from '@redux/services/compare/fetchResources';

import {ComparisonListItem} from '@components/organisms/CompareModal/ComparisonList';

/* * * * * * * * * * * * * *
 * State definition
 * * * * * * * * * * * * * */
export type CompareState = {
  isOpen: boolean;
  views: SavedComparisonView[];
  current: {
    view: ComparisonView | SavedComparisonView;
    left?: ResourceSetData;
    right?: ResourceSetData;
    comparison?: ComparisonData;
    selection: string[];
    viewDiff?: string; // comparisonId
  };
};

export type CompareSide = 'left' | 'right';

export type ComparisonData = {
  loading: boolean;
  comparisons: ResourceComparison[];
};

export type ResourceSetData = {
  loading: boolean;
  error: boolean;
  resources: K8sResource[];
};

export type CompareOperation = 'union' | 'intersection' | 'symmetricDifference' | 'leftDifference' | 'rightDifference';

export type CompareFilter = {
  namespace?: string;
};

export type ComparisonView = {
  leftSet: ResourceSet | undefined;
  rightSet: ResourceSet | undefined;
  operation: CompareOperation;
  filter?: CompareFilter;
};

export type SavedComparisonView = ComparisonView & {
  name: string;
  viewedAt: Date;
};

export type ResourceSet = LocalResourceSet | KustomizeResourceSet | HelmResourceSet | ClusterResourceSet;

export type LocalResourceSet = {
  type: 'local';
  defaultNamespace?: string;
};

export type KustomizeResourceSet = {
  type: 'kustomize';
  kustomizationPath: string; // so resource.filePath (because internal id changes and this persists)
  defaultNamespace?: string;
};

export type HelmResourceSet = {
  type: 'helm';
  chartPath: string; // e.g. "postgresql"
  values: string;
  defaultNamespace?: string;
};

export type ClusterResourceSet = {
  type: 'cluster';
  context: string;
};

export type ResourceComparison =
  | {
      // appears in leftDiff | symmetricDifference | union
      id: string;
      isMatch: false;
      left: K8sResource;
      right: undefined;
    }
  | {
      // appears in rightDiff | symmetricDifference | union
      id: string;
      isMatch: false;
      left: undefined;
      right: K8sResource;
    }
  | MatchingResourceComparison;

type MatchingResourceComparison = {
  // appears in intersection | union
  id: string;
  isMatch: true;
  isDifferent: boolean;
  left: K8sResource;
  right: K8sResource;
};

/* * * * * * * * * * * * * *
 * Initial state
 * * * * * * * * * * * * * */
const initialState: CompareState = {
  isOpen: false,
  views: [],
  current: {
    view: {
      operation: 'union',
      leftSet: undefined,
      rightSet: undefined,
    },
    selection: [],
  },
};

/* * * * * * * * * * * * * *
 * Slice definition
 * * * * * * * * * * * * * */
export const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    compareToggled: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload === undefined) {
        state.isOpen = !state.isOpen;
      } else {
        state.isOpen = action.payload;
      }
    },
    operationUpdated: (state, action: PayloadAction<{operation: CompareOperation}>) => {
      state.current.view.operation = action.payload.operation;
    },
    filterUpdated: (state, action: PayloadAction<{filter: Partial<CompareFilter>}>) => {
      const currentFilter = state.current.view.filter;
      const newFilter = action.payload.filter;

      if (!currentFilter) {
        state.current.view.filter = newFilter;
      } else {
        state.current.view.filter = {
          ...currentFilter,
          ...newFilter,
        };
      }
    },
    resourceSetSelected: (state, action: PayloadAction<{side: CompareSide; value: ResourceSet}>) => {
      const {side, value} = action.payload;
      resetComparison(state);

      if (side === 'left') {
        state.current.view.leftSet = value;
        state.current.left = {
          loading: true,
          error: false,
          resources: [],
        };
      } else {
        state.current.view.rightSet = value;
        state.current.right = {
          loading: true,
          error: false,
          resources: [],
        };
      }
    },
    resourceSetCleared: (state, action: PayloadAction<{side: CompareSide | 'both'}>) => {
      const side = action.payload.side;
      resetComparison(state);

      if (['left', 'both'].includes(side)) {
        state.current.view.leftSet = undefined;
        state.current.left = undefined;
      }
      if (['right', 'both'].includes(side)) {
        state.current.view.rightSet = undefined;
        state.current.right = undefined;
      }
    },
    resourceSetRefreshed: (state, action: PayloadAction<{side: CompareSide}>) => {
      const {side} = action.payload;
      resetComparison(state);

      state.current[side] = {
        loading: true,
        error: false,
        resources: [],
      };
    },
    diffViewOpened: (state, action: PayloadAction<{id: string | undefined}>) => {
      state.current.viewDiff = action.payload.id;
    },
    comparisonToggled: (state, action: PayloadAction<{id: string}>) => {
      const {id} = action.payload;

      const index = state.current.selection.findIndex(comparison => comparison === id);
      if (index === -1) {
        state.current.selection.push(id);
      } else {
        state.current.selection.splice(index, 1);
      }
    },
    comparisonAllToggled: state => {
      const isAllSelected = selectIsAllComparisonSelected(state);
      if (isAllSelected) {
        state.current.selection = [];
      } else {
        state.current.selection = state.current.comparison?.comparisons.map(c => c.id) ?? [];
      }
    },
    resourceSetFetched: (state, action: PayloadAction<{side: CompareSide; resources: K8sResource[]}>) => {
      const {side, resources} = action.payload;
      state.current[side] = {
        error: false,
        loading: false,
        resources,
      };

      const leftReady = state.current.left && !state.current.left.loading && !state.current.left.error;
      const rightReady = state.current.right && !state.current.right.loading && !state.current.right.error;
      if (leftReady && rightReady) {
        state.current.comparison = {
          loading: true,
          comparisons: [],
        };
      }
    },
    resourceSetFetchFailed: (state, action: PayloadAction<{side: CompareSide; reason: string}>) => {
      const {side, reason} = action.payload;
      log.debug('[compare] resource set fetch failed', reason);

      state.current[side] = {
        error: true,
        loading: false,
        resources: [],
      };
    },
    resourceSetCompared: (state, action: PayloadAction<{comparisons: ResourceComparison[]}>) => {
      state.current.comparison = {
        loading: false,
        comparisons: action.payload.comparisons,
      };
    },
  },
});

function resetComparison(state: WritableDraft<CompareState>) {
  state.current.comparison = undefined;
  state.current.viewDiff = undefined;
  state.current.selection = [];
}

/* * * * * * * * * * * * * *
 * Export
 * * * * * * * * * * * * * */
export default compareSlice.reducer;
export const {
  compareToggled,
  filterUpdated,
  operationUpdated,
  resourceSetCleared,
  resourceSetRefreshed,
  resourceSetSelected,
  resourceSetFetchFailed,
  resourceSetFetched,
  resourceSetCompared,
  diffViewOpened,
  comparisonAllToggled,
  comparisonToggled,
} = compareSlice.actions;

/* * * * * * * * * * * * * *
 * Selectors
 * * * * * * * * * * * * * */
export type CompareStatus = 'selecting' | 'comparing';
export const selectCompareStatus = (state: CompareState): CompareStatus => {
  const c = state.current;

  const empty = !c.left && !c.right;
  const leftSuccess = c.left && !c.left.loading && !c.left.error;
  const rightSuccess = c.right && !c.right.loading && !c.right.error;
  if (empty || !leftSuccess || !rightSuccess) {
    return 'selecting';
  }

  return 'comparing';
};

export const selectDiffedComparison = (state: CompareState): MatchingResourceComparison | undefined => {
  const id = state.current.viewDiff;
  if (!id) return undefined;
  const comparison = state.current.comparison?.comparisons.find(c => c.id === id);
  if (!comparison || !comparison.isMatch) return undefined;
  return comparison;
};

export const selectIsComparisonSelected = (state: CompareState, id: string): boolean => {
  return state.current.selection.some(comparisonId => comparisonId === id);
};

export const selectIsAllComparisonSelected = (state: CompareState): boolean => {
  return (
    !state.current.comparison?.loading &&
    state.current.selection.length === state.current.comparison?.comparisons.length
  );
};

export const selectComparisonListItems = createSelector(
  (state: CompareState) => state.current.comparison?.comparisons,
  comparisons => {
    const result: ComparisonListItem[] = [];

    const groups = groupBy(comparisons, r => {
      if (r.isMatch) return r.left.kind;
      return r.left ? r.left.kind : r.right.kind;
    });

    Object.entries(groups).forEach(([kind, comps]) => {
      result.push({type: 'header', kind, count: comps.length});

      comps.forEach(comparison => {
        if (comparison.isMatch) {
          result.push({
            type: 'comparison',
            id: comparison.id,
            name: comparison.left.name,
            namespace: comparison.left.namespace ?? 'default',
            leftActive: true,
            rightActive: true,
            canDiff: comparison.isDifferent,
          });
        } else {
          result.push({
            type: 'comparison',
            id: comparison.id,
            name: comparison.left?.name ?? comparison.right?.name ?? 'unknown',
            namespace: comparison.left?.namespace ?? comparison.right?.namespace ?? 'default',
            leftActive: Boolean(comparison.left),
            rightActive: Boolean(comparison.right),
            canDiff: false,
          });
        }
      });
    });

    return result;
  }
);

/* * * * * * * * * * * * * *
 * Listeners
 * * * * * * * * * * * * * */
export const resourceFetchListener =
  (side: CompareSide): AppListenerFn =>
  listen => {
    listen({
      predicate: action => {
        const resourceSetUpdated = isAnyOf(resourceSetSelected, resourceSetRefreshed, resourceSetCleared);
        if (!resourceSetUpdated(action)) return false;
        const actionSide = action.payload.side;
        return actionSide === side;
      },
      effect: async (action, {dispatch, getState, cancelActiveListeners}) => {
        try {
          cancelActiveListeners();
          if (resourceSetCleared.match(action)) return;

          const state = getState();
          const options = side === 'left' ? state.compare.current.view.leftSet : state.compare.current.view.rightSet;
          if (!options) return;

          const resources = await fetchResources(state, options);

          dispatch(resourceSetFetched({side, resources}));
        } catch (err) {
          if (err instanceof TaskAbortError) return;
          const reason = err instanceof Error ? err.message : 'unknown failure';
          dispatch(resourceSetFetchFailed({side, reason}));
        }
      },
    });
  };

export const compareListener: AppListenerFn = listen => {
  listen({
    actionCreator: resourceSetFetched,
    effect: async (_action, {dispatch, getState}) => {
      const status = selectCompareStatus(getState().compare);
      const left = getState().compare.current.left;
      const right = getState().compare.current.right;

      if (status !== 'comparing' || !left || !right) {
        return;
      }

      const comparisons = compareResources(left.resources, right.resources, {operation: 'union'});
      dispatch(resourceSetCompared({comparisons}));
    },
  });
};
