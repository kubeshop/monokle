import {PayloadAction, TaskAbortError, createSelector, createSlice, isAnyOf} from '@reduxjs/toolkit';

import {WritableDraft} from 'immer/dist/internal';
import {groupBy} from 'lodash';
import log from 'loglevel';

import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {AppListenerFn} from '@redux/listeners/base';
import {kustomizationsSelector} from '@redux/selectors';
import {compareResources} from '@redux/services/compare/compareResources';
import {fetchResources} from '@redux/services/compare/fetchResources';
import {createResourceFilters, filterComparisons} from '@redux/services/compare/filterComparisons';

import type {ComparisonListItem} from '@components/organisms/CompareModal/types';

import {isDefined} from '@utils/filter';

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
    search?: string;
    filtering?: {
      comparisons: ResourceComparison[];
    };
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

export type CompareOperation = 'union' | 'intersection' | 'symmetricDifference' | 'leftJoin' | 'rightJoin';

export type CompareFilter = {
  namespace?: string;
};

export type ComparisonView = {
  leftSet?: PartialResourceSet;
  rightSet?: PartialResourceSet;
  operation?: CompareOperation;
  filter?: CompareFilter;
};

export type SavedComparisonView = ComparisonView & {
  name: string;
  viewedAt: Date;
};

export type PartialResourceSet = Pick<ResourceSet, 'type'> & Partial<ResourceSet>;
export type ResourceSet = LocalResourceSet | KustomizeResourceSet | HelmResourceSet | ClusterResourceSet;

export type LocalResourceSet = {
  type: 'local';
  defaultNamespace?: string;
};

export type KustomizeResourceSet = {
  type: 'kustomize';
  kustomizationId: string; // so resource.filePath (because internal id changes and this persists)
  defaultNamespace?: string;
};

export type HelmResourceSet = {
  type: 'helm';
  chartId: string;
  valuesId: string;
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
      resetComparison(state);
    },
    searchUpdated: (state, action: PayloadAction<{search: string}>) => {
      state.current.search = action.payload.search;
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
    resourceSetSelected: (state, action: PayloadAction<{side: CompareSide; value: PartialResourceSet}>) => {
      const {side, value} = action.payload;
      resetComparison(state);
      if (side === 'left') {
        state.current.view.leftSet = value;
        state.current.left = undefined;
      } else {
        state.current.view.rightSet = value;
        state.current.right = undefined;
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
      state.current[side] = undefined;
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
    resourceSetFetchPending: (state, action: PayloadAction<{side: CompareSide}>) => {
      const {side} = action.payload;

      state.current[side] = {
        loading: true,
        error: false,
        resources: [],
      };
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
    resourceSetFiltered: (state, action: PayloadAction<{comparisons: ResourceComparison[]}>) => {
      state.current.filtering = {
        comparisons: action.payload.comparisons,
      };
    },
  },
});

function resetComparison(state: WritableDraft<CompareState>) {
  state.current.comparison = undefined;
  state.current.viewDiff = undefined;
  state.current.selection = [];

  state.current.filtering = undefined;
}

/* * * * * * * * * * * * * *
 * Export
 * * * * * * * * * * * * * */
export default compareSlice.reducer;
export const {
  compareToggled,
  searchUpdated,
  filterUpdated,
  operationUpdated,
  resourceSetCleared,
  resourceSetRefreshed,
  resourceSetSelected,
  resourceSetFetchPending,
  resourceSetFetchFailed,
  resourceSetFetched,
  resourceSetCompared,
  resourceSetFiltered,
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

export const selectResourceSet = (state: CompareState, side: CompareSide): PartialResourceSet | undefined => {
  return side === 'left' ? state.current.view.leftSet : state.current.view.rightSet;
};

export const selectClusterResourceSet = (state: RootState, side: CompareSide) => {
  const resourceSet = selectResourceSet(state.compare, side);
  if (resourceSet?.type !== 'cluster') return undefined;
  const {context} = resourceSet;

  const allContexts = state.config.kubeConfig.contexts ?? [];
  const currentContext = allContexts.find(c => c.name === context);

  return {
    currentContext,
    allContexts,
  };
};

export const selectHelmResourceSet = (state: RootState, side: CompareSide) => {
  const resourceSet = selectResourceSet(state.compare, side);
  if (resourceSet?.type !== 'helm') return undefined;
  const {chartId, valuesId} = resourceSet;

  const currentHelmChart = chartId ? state.main.helmChartMap[chartId] : undefined;
  const currentHelmValues = valuesId ? state.main.helmValuesMap[valuesId] : undefined;
  const allHelmCharts = Object.values(state.main.helmChartMap);
  const availableHelmValues = currentHelmChart
    ? Object.values(state.main.helmValuesMap).filter(values => currentHelmChart.valueFileIds.includes(values.id))
    : [];

  return {
    currentHelmChart,
    currentHelmValues,
    allHelmCharts,
    availableHelmValues,
  };
};

export const selectKustomizeResourceSet = (state: RootState, side: CompareSide) => {
  const resourceSet = selectResourceSet(state.compare, side);
  if (resourceSet?.type !== 'kustomize') return undefined;
  const {kustomizationId} = resourceSet;

  const currentKustomization = kustomizationId ? state.main.resourceMap[kustomizationId] : undefined;
  const allKustomizations = kustomizationsSelector(state);

  return {allKustomizations, currentKustomization};
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
  (state: CompareState) => state.current.filtering?.comparisons,
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
 * Utilities
 * * * * * * * * * * * * * */
export function isCompleteResourceSet(options: PartialResourceSet | undefined): options is ResourceSet {
  switch (options?.type) {
    case 'local':
      return true;
    case 'cluster':
      return isDefined(options.context);
    case 'kustomize':
      return isDefined(options.kustomizationId);
    case 'helm':
      return isDefined(options.chartId) && isDefined(options.valuesId);
    default:
      return false;
  }
}

/* * * * * * * * * * * * * *
 * Listeners
 * * * * * * * * * * * * * */
export const resourceFetchListener =
  (side: CompareSide): AppListenerFn =>
  listen => {
    listen({
      predicate: (action, state) => {
        const resourceSetUpdated = isAnyOf(resourceSetSelected, resourceSetRefreshed, resourceSetCleared);
        if (!resourceSetUpdated(action)) return false;

        const actionSide = action.payload.side;
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
          const options = side === 'left' ? state.compare.current.view.leftSet : state.compare.current.view.rightSet;
          if (!isCompleteResourceSet(options)) return;

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
    matcher: isAnyOf(resourceSetFetched, operationUpdated),
    effect: async (_action, {dispatch, getState}) => {
      const status = selectCompareStatus(getState().compare);
      const current = getState().compare.current;
      const {left, right, view} = current;

      if (status !== 'comparing' || !left || !right) {
        return;
      }

      const options = {operation: view.operation ?? 'union'};
      const comparisons = compareResources(left.resources, right.resources, options);
      dispatch(resourceSetCompared({comparisons}));
    },
  });
};

export const filterListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(resourceSetCompared, filterUpdated, searchUpdated),
    effect: async (_, {dispatch, getState, cancelActiveListeners, delay}) => {
      cancelActiveListeners();
      await delay(3);

      const {search, comparison} = getState().compare.current;
      const comparisons = comparison?.comparisons ?? [];
      const filters = createResourceFilters({search});
      const filteredComparisons = filterComparisons(comparisons, filters);
      const action = resourceSetFiltered({comparisons: filteredComparisons});
      dispatch(action);
    },
  });
};
