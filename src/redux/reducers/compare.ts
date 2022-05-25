import {PayloadAction, TaskAbortError, createAsyncThunk, createSelector, createSlice, isAnyOf} from '@reduxjs/toolkit';

import {WritableDraft} from 'immer/dist/internal';
import {groupBy} from 'lodash';
import log from 'loglevel';
import invariant from 'tiny-invariant';

import {ERROR_MSG_FALLBACK} from '@constants/constants';

import {AlertType} from '@models/alert';
import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';
import {ThunkApi} from '@models/thunk';

import {AppListenerFn} from '@redux/listeners/base';
import {kustomizationsSelector} from '@redux/selectors';
import {compareResources} from '@redux/services/compare/compareResources';
import {fetchResources} from '@redux/services/compare/fetchResources';
import {createResourceFilters, filterComparisons} from '@redux/services/compare/filterComparisons';
import {canTransfer, doTransferResource} from '@redux/services/compare/transferResource';

import type {ComparisonListItem} from '@components/organisms/CompareModal/types';

import {errorAlert, successAlert} from '@utils/alert';
import {isDefined} from '@utils/filter';

import {getResourceKindHandler} from '@src/kindhandlers';

import {setAlert} from './alert';

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
    inspect?: ComparisonInspection;
    search?: string;
    filtering?: {
      comparisons: ResourceComparison[];
    };
    transfering: {
      pending: boolean;
    };
  };
};

export type CompareSide = 'left' | 'right';
export type TransferDirection = 'left-to-right' | 'right-to-left';

export type ComparisonData = {
  loading: boolean;
  comparisons: ResourceComparison[];
};

export type ComparisonInspection = {
  comparison: string;
  type: CompareSide | 'diff';
};

export type ResourceSetData = {
  loading: boolean;
  error: boolean;
  resources: K8sResource[];
};

export type CompareOperation = 'union' | 'intersection' | 'symmetricDifference' | 'leftJoin' | 'rightJoin';

export type CompareFilter = {
  namespace?: string;
  kind?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

export type ComparisonView = {
  leftSet?: PartialResourceSet;
  rightSet?: PartialResourceSet;
  operation?: CompareOperation;
  filter?: CompareFilter;
  namespace?: string;
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
    transfering: {
      pending: false,
    },
  },
};

/* * * * * * * * * * * * * *
 * Slice definition
 * * * * * * * * * * * * * */
export const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    compareToggled: (state, action: PayloadAction<{value: boolean | undefined; initialView?: ComparisonView}>) => {
      const {value, initialView} = action.payload;
      if (value === undefined) {
        state.isOpen = !state.isOpen;
      } else {
        state.isOpen = value;
      }

      if (initialView) {
        state.current.view = initialView;
      }
    },
    operationUpdated: (state, action: PayloadAction<{operation: CompareOperation}>) => {
      state.current.view.operation = action.payload.operation;
      resetComparison(state);
    },
    searchUpdated: (state, action: PayloadAction<{search: string | undefined}>) => {
      state.current.search = action.payload.search;
    },
    namespaceUpdated: (state, action: PayloadAction<{namespace: string | undefined}>) => {
      state.current.view.namespace = action.payload.namespace;
    },
    filterUpdated: (state, action: PayloadAction<{filter: CompareFilter | undefined}>) => {
      const newFilter = action.payload.filter;
      const isEmpty = !newFilter || Object.keys(newFilter).length === 0;

      if (isEmpty) {
        state.current.view.filter = undefined;
      } else {
        state.current.view.filter = action.payload.filter;
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
    comparisonInspecting: (state, action: PayloadAction<ComparisonInspection>) => {
      state.current.inspect = action.payload;
    },
    comparisonInspected: state => {
      state.current.inspect = undefined;
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
  extraReducers: builder => {
    builder.addCase(transferResource.pending, state => {
      state.current.transfering.pending = true;
    });
    builder.addCase(transferResource.rejected, state => {
      state.current.transfering.pending = false;
    });
    builder.addCase(transferResource.fulfilled, (state, action) => {
      state.current.transfering.pending = false;

      const {side, delta} = action.payload;

      // Splice each update into previous results to give smooth UX.
      delta.forEach(comparison => {
        // Remove from selection
        state.current.selection = state.current.selection.filter(s => s !== comparison.id);

        // Update comparison without recomputing
        if (state.current.comparison) {
          const index = state.current.comparison.comparisons.findIndex(c => c.id === comparison.id) ?? -1;
          if (index !== -1) {
            state.current.comparison.comparisons.splice(index, 1, comparison);
          } else {
            state.current.comparison.comparisons.push(comparison);
          }
        }

        // Update filtering without recomparing
        if (state.current.filtering) {
          const index = state.current.filtering.comparisons.findIndex(c => c.id === comparison.id) ?? -1;
          if (index !== -1) {
            state.current.filtering.comparisons.splice(index, 1, comparison);
          } else {
            state.current.filtering.comparisons.push(comparison);
          }
        }

        // Update resource sets without refetching
        if (side === 'left' && state.current.left) {
          const index = state.current.left.resources.findIndex(r => r.id === comparison.left.id) ?? -1;
          if (index === -1) {
            state.current.left.resources.push(comparison.left);
          } else {
            state.current.left.resources[index] = comparison.left;
          }
        }
        if (side === 'right' && state.current.right) {
          const index = state.current.right.resources.findIndex(r => r.id === comparison.right.id) ?? -1;
          if (index === -1) {
            state.current.right.resources.push(comparison.right);
          } else {
            state.current.right.resources[index] = comparison.right;
          }
        }
      });
    });
  },
});

function resetComparison(state: WritableDraft<CompareState>) {
  state.current.comparison = undefined;
  state.current.inspect = undefined;
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
  namespaceUpdated,
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
  comparisonInspecting,
  comparisonInspected,
  comparisonAllToggled,
  comparisonToggled,
} = compareSlice.actions;

/* * * * * * * * * * * * * *
 * Selectors
 * * * * * * * * * * * * * */
export type CompareStatus = 'selecting' | 'comparing' | 'inspecting' | 'transfering';
export const selectCompareStatus = (state: CompareState): CompareStatus => {
  const c = state.current;

  const empty = !c.left && !c.right;
  const leftSuccess = c.left && !c.left.loading && !c.left.error;
  const rightSuccess = c.right && !c.right.loading && !c.right.error;
  if (empty || !leftSuccess || !rightSuccess) {
    return 'selecting';
  }

  if (c.transfering.pending) {
    return 'transfering';
  }

  return c.inspect ? 'inspecting' : 'comparing';
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

export const selectComparison = (state: CompareState, id: string | undefined): ResourceComparison | undefined => {
  if (!id) return undefined;
  return state.current.comparison?.comparisons.find(c => c.id === id);
};

export const selectKnownNamespaces = createSelector(
  (state: CompareState) => state.current.left,
  (state: CompareState) => state.current.right,
  (left, right) => {
    const set = new Set();
    left?.resources.forEach(r => set.add(r.namespace ?? 'default'));
    right?.resources.forEach(r => set.add(r.namespace ?? 'default'));
    return Array.from(set.values());
  }
);
export const selectIsComparisonSelected = (state: CompareState, id: string): boolean => {
  return state.current.selection.some(comparisonId => comparisonId === id);
};

export const selectIsAllComparisonSelected = (state: CompareState): boolean => {
  return (
    !state.current.comparison?.loading &&
    state.current.selection.length === state.current.comparison?.comparisons.length
  );
};

export const selectCanTransfer = (state: CompareState, direction: TransferDirection, ids: string[]): boolean => {
  // Cannot transfer in invalid state.
  const status = selectCompareStatus(state);
  if (status === 'selecting' || status === 'transfering' || ids.length === 0) {
    return false;
  }

  // Cannot transfer when the resource set type is non-transferable.
  const left = state.current.view.leftSet?.type;
  const right = state.current.view.rightSet?.type;
  const isTransferable = direction === 'left-to-right' ? canTransfer(left, right) : canTransfer(right, left);
  if (!isTransferable) {
    return false;
  }

  // Can only transfer if all selected items are transferable.
  const comparisons = state.current.filtering?.comparisons ?? [];
  const transferable = comparisons
    .filter(comparison => ids.some(id => id === comparison.id))
    .filter(comparison => (direction === 'left-to-right' ? comparison.left : comparison.right));
  return ids.length === transferable.length;
};

export const selectComparisonListItems = createSelector(
  (state: CompareState) => state.current.filtering?.comparisons,
  (state: CompareState) => [state.current.view.leftSet?.type, state.current.view.rightSet?.type],
  (state: CompareState) => state.current.view.namespace,
  (comparisons = [], [leftType, rightType], defaultNamespace) => {
    const result: ComparisonListItem[] = [];

    const transferable = canTransfer(leftType, rightType);

    const groups = groupBy(comparisons, r => {
      if (r.isMatch) return r.left.kind;
      return r.left ? r.left.kind : r.right.kind;
    });

    Object.entries(groups).forEach(([kind, comps]) => {
      result.push({type: 'header', kind, count: comps.length});
      const isNamespaced = getResourceKindHandler(kind)?.isNamespaced ?? true;

      comps.forEach(comparison => {
        if (comparison.isMatch) {
          result.push({
            type: 'comparison',
            id: comparison.id,
            name: comparison.left.name,
            namespace: isNamespaced ? comparison.left.namespace ?? defaultNamespace ?? 'default' : undefined,
            leftActive: true,
            rightActive: true,
            leftTransferable: transferable,
            rightTransferable: transferable,
            canDiff: comparison.isDifferent,
          });
        } else {
          result.push({
            type: 'comparison',
            id: comparison.id,
            name: comparison.left?.name ?? comparison.right?.name ?? 'unknown',
            namespace: isNamespaced
              ? comparison.left?.namespace ?? comparison.right?.namespace ?? defaultNamespace ?? 'default'
              : undefined,
            leftActive: isDefined(comparison.left),
            rightActive: isDefined(comparison.right),
            leftTransferable: transferable && isDefined(comparison.left),
            rightTransferable: transferable && isDefined(comparison.right),
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
      await delay(3);

      const {search, comparison, view} = getState().compare.current;
      const allComparisons = comparison?.comparisons ?? [];
      const filters = createResourceFilters({search, ...view.filter});
      const comparisons = filterComparisons(allComparisons, filters);

      dispatch(resourceSetFiltered({comparisons}));
    },
  });
};

/* * * * * * * * * * * * * *
 * Thunks
 * * * * * * * * * * * * * */
type TransferResourceArgs = {
  ids: string[];
  direction: TransferDirection;
};

export const transferResource = createAsyncThunk<
  {side: CompareSide; delta: MatchingResourceComparison[]},
  TransferResourceArgs,
  ThunkApi
>('compare/transfer', async ({ids, direction}, {getState, dispatch}) => {
  try {
    const delta: MatchingResourceComparison[] = [];
    const failures: string[] = [];

    const namespace = getState().compare.current.view.namespace;
    const leftSet = getState().compare.current.view.leftSet;
    const rightSet = getState().compare.current.view.rightSet;
    invariant(leftSet && rightSet, 'invalid state');
    const context =
      direction === 'left-to-right'
        ? rightSet.type === 'cluster'
          ? rightSet.context
          : undefined
        : leftSet.type === 'cluster'
        ? leftSet.context
        : undefined;

    const from = direction === 'left-to-right' ? leftSet.type : rightSet.type;
    const to = direction === 'left-to-right' ? rightSet.type : leftSet.type;

    const comparisons = getState().compare.current.comparison?.comparisons.filter(c => ids.includes(c.id)) ?? [];

    // eslint-disable-next-line no-restricted-syntax
    for (const comparison of comparisons) {
      try {
        const source = direction === 'left-to-right' ? comparison.left : comparison.right;
        const target = direction === 'left-to-right' ? comparison.right : comparison.left;
        invariant(source, 'invalid state');

        const options = {from, to, context, namespace};
        // Note: Need to apply one-by-one as it fails in bulk.
        // eslint-disable-next-line no-await-in-loop
        const newTarget = await doTransferResource(source, target, options, getState(), dispatch);

        delta.push({
          ...comparison,
          left: direction === 'left-to-right' ? source : newTarget,
          right: direction === 'left-to-right' ? newTarget : source,
          isMatch: true,
          isDifferent: source.text !== newTarget.text,
        });
      } catch (err) {
        failures.push(comparison.id);
        log.debug('transfer resource failed - ', err);
      }
    }

    const alert = createTransferAlert(ids, failures, to === 'cluster');
    dispatch(setAlert(alert));

    return {side: direction === 'left-to-right' ? 'right' : 'left', delta};
  } catch (err) {
    log.debug('Transfer failed unexpectedly', err);
    dispatch(setAlert(errorAlert(ERROR_MSG_FALLBACK)));
    throw err;
  }
});

function createTransferAlert(total: string[], failures: string[], toCluster: boolean): AlertType {
  const totalCount = total.length;
  const errorCount = failures.length;
  const success = errorCount === 0;

  if (!success) {
    const verb = toCluster ? 'deploy' : 'extract';
    const title = `Cannot ${verb} resources`;
    const message =
      totalCount === errorCount
        ? `Looks like all resources failed to ${verb}. Please try again later.`
        : `Looks like ${errorCount} of the ${totalCount} resources failed to ${verb}. Please try again later.`;
    return errorAlert(title, message);
  }

  const verb = toCluster ? 'Applied' : 'Extracted';
  const title = `${verb} ${totalCount} resources`;
  return successAlert(title);
}
