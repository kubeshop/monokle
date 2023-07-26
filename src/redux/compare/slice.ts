import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {WritableDraft} from 'immer/dist/internal';
import log from 'loglevel';

import {setRootFolder} from '@redux/thunks/setRootFolder';

import {
  CompareFilter,
  CompareOperation,
  CompareSide,
  CompareState,
  ComparisonInspection,
  ComparisonView,
  PartialResourceSet,
  ResourceComparison,
} from '@shared/models/compare';
import {K8sResource} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils/telemetry';

import {initialState} from './initialState';
import {selectIsAllComparisonSelected} from './selectors';
import {transferResource} from './thunks';

export const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    compareToggled: (
      state: Draft<CompareState>,
      action: PayloadAction<{
        initialView: ComparisonView;
        from?: 'compare-button' | 'quick-helm-compare' | 'quick-kustomize-compare';
      }>
    ) => {
      const {initialView} = action.payload;

      if (initialView) {
        state.current.view = initialView;
      }

      trackEvent('compare/opened', {from: action.payload.from});
    },
    operationUpdated: (state: Draft<CompareState>, action: PayloadAction<{operation: CompareOperation}>) => {
      state.current.view.operation = action.payload.operation;
      resetComparison(state);
    },
    searchUpdated: (state: Draft<CompareState>, action: PayloadAction<{search: string | undefined}>) => {
      state.current.search = action.payload.search;
    },
    namespaceUpdated: (state: Draft<CompareState>, action: PayloadAction<{namespace: string | undefined}>) => {
      state.current.view.namespace = action.payload.namespace;
    },
    filterUpdated: (state: Draft<CompareState>, action: PayloadAction<{filter: CompareFilter | undefined}>) => {
      const newFilter = action.payload.filter;
      const isEmpty = !newFilter || Object.keys(newFilter).length === 0;

      if (isEmpty) {
        state.current.view.filter = undefined;
      } else {
        state.current.view.filter = action.payload.filter;
      }
    },
    resourceSetSelected: (
      state: Draft<CompareState>,
      action: PayloadAction<{side: CompareSide; value: PartialResourceSet}>
    ) => {
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
    resourceSetCleared: (state: Draft<CompareState>, action: PayloadAction<{side: CompareSide | 'both'}>) => {
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
    resourceSetRefreshed: (state: Draft<CompareState>, action: PayloadAction<{side: CompareSide}>) => {
      const {side} = action.payload;
      resetComparison(state);
      state.current[side] = undefined;
    },
    comparisonInspecting: (state: Draft<CompareState>, action: PayloadAction<ComparisonInspection>) => {
      const currentComparison = state.current.comparison?.comparisons.find(c => c.id === action.payload.comparison);
      const resourceApiVersion = currentComparison?.left?.apiVersion ?? currentComparison?.right?.apiVersion;
      const resourceKind = currentComparison?.left?.kind ?? currentComparison?.right?.kind;
      trackEvent('compare/inspected', {type: action.payload.type, resourceApiVersion, resourceKind});
      state.current.inspect = action.payload;
    },
    comparisonInspected: state => {
      state.current.inspect = undefined;
    },
    comparisonToggled: (state: Draft<CompareState>, action: PayloadAction<{id: string}>) => {
      const {id} = action.payload;

      const index = state.current.selection.findIndex(comparison => comparison === id);
      if (index === -1) {
        state.current.selection.push(id);
      } else {
        state.current.selection.splice(index, 1);
      }
    },
    comparisonAllToggled: (state: Draft<CompareState>) => {
      const isAllSelected = selectIsAllComparisonSelected(state);
      if (isAllSelected) {
        state.current.selection = [];
      } else {
        state.current.selection = state.current.comparison?.comparisons.map(c => c.id) ?? [];
      }
    },
    resourceSetFetchPending: (state: Draft<CompareState>, action: PayloadAction<{side: CompareSide}>) => {
      const {side} = action.payload;

      state.current[side] = {
        loading: true,
        error: false,
        resources: [],
      };
    },
    resourceSetFetched: (
      state: Draft<CompareState>,
      action: PayloadAction<{side: CompareSide; resources: K8sResource[]}>
    ) => {
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
    resourceSetFetchFailed: (
      state: Draft<CompareState>,
      action: PayloadAction<{side: CompareSide; reason: string}>
    ) => {
      const {side, reason} = action.payload;
      log.debug('[compare] resource set fetch failed', reason);

      state.current[side] = {
        error: true,
        loading: false,
        resources: [],
      };
    },
    resourceSetCompared: (state: Draft<CompareState>, action: PayloadAction<{comparisons: ResourceComparison[]}>) => {
      trackEvent('compare/compared', {
        left: state.current.view.leftSet?.type,
        right: state.current.view.rightSet?.type,
        operation: state.current.view.operation ?? 'default',
      });

      state.current.comparison = {
        loading: false,
        comparisons: action.payload.comparisons,
      };
    },
    resourceSetFilterPending: (state: Draft<CompareState>) => {
      state.current.filtering = {
        pending: true,
        comparisons: [],
      };
    },
    resourceSetFiltered: (state: Draft<CompareState>, action: PayloadAction<{comparisons: ResourceComparison[]}>) => {
      state.current.filtering = {
        pending: false,
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
      const {side, delta} = action.payload;

      const direction = action.meta.arg.direction;
      const leftSet = state.current.view.leftSet;
      const rightSet = state.current.view.rightSet;
      const from = direction === 'left-to-right' ? leftSet?.type : rightSet?.type;
      const to = direction === 'left-to-right' ? rightSet?.type : leftSet?.type;
      trackEvent('compare/transfered', {from, to, count: delta.length});

      state.current.transfering.pending = false;

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
    builder.addCase(setRootFolder.fulfilled, state => {
      state.current = initialState.current;
    });
  },
});

function resetComparison(state: WritableDraft<CompareState>) {
  state.current.comparison = undefined;
  state.current.inspect = undefined;
  state.current.selection = [];

  state.current.filtering = undefined;
}

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
  resourceSetFilterPending,
  resourceSetFiltered,
  comparisonInspecting,
  comparisonInspected,
  comparisonAllToggled,
  comparisonToggled,
} = compareSlice.actions;

export default compareSlice.reducer;
