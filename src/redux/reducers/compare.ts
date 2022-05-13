import {PayloadAction, TaskAbortError, createSlice, isAnyOf} from '@reduxjs/toolkit';

import {times} from 'lodash';
import log from 'loglevel';

import {K8sResource} from '@models/k8sresource';

import {startAppListening} from '@redux/listeners/base';

import {basicDeploymentFixture} from '@components/organisms/CompareModal/__test__/fixtures/basicDeployment';

import faker from '@faker-js/faker';

/* * * * * * * * * * * * * *
 * State definition
 * * * * * * * * * * * * * */
export type CompareState = {
  isOpen: boolean;
  views: SavedDiffView[];
  current: {
    view: DiffView | SavedDiffView;
    left?: ResourceSetData;
    right?: ResourceSetData;
    diff?: DiffData;
    selection: string[];
    viewDiff?: string; // comparisonId
  };
};

export type CompareSide = 'left' | 'right';

export type DiffData = {
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

export type DiffView = {
  leftSet: ResourceSet | undefined;
  rightSet: ResourceSet | undefined;
  operation: CompareOperation;
  filter?: CompareFilter;
};

export type SavedDiffView = DiffView & {
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

      if (side === 'left') {
        state.current.view.leftSet = value;
        state.current.left = {
          loading: true,
          error: false,
          resources: [],
        };

        state.current.diff = undefined;
        state.current.viewDiff = undefined;
        state.current.selection = [];
      } else {
        state.current.view.rightSet = value;
        state.current.right = {
          loading: true,
          error: false,
          resources: [],
        };

        state.current.diff = undefined;
        state.current.viewDiff = undefined;
        state.current.selection = [];
      }
    },
    resourceSetCleared: (state, action: PayloadAction<{side: CompareSide | 'both'}>) => {
      const side = action.payload.side;
      if (['left', 'both'].includes(side)) {
        state.current.view.leftSet = undefined;
        state.current.left = undefined;

        state.current.diff = undefined;
        state.current.viewDiff = undefined;
        state.current.selection = [];
      }
      if (['right', 'both'].includes(side)) {
        state.current.view.rightSet = undefined;
        state.current.right = undefined;

        state.current.diff = undefined;
        state.current.viewDiff = undefined;
        state.current.selection = [];
      }
    },
    resourceSetRefreshed: (state, action: PayloadAction<{side: CompareSide}>) => {
      const {side} = action.payload;
      state.current[side] = {
        loading: true,
        error: false,
        resources: [],
      };

      state.current.diff = undefined;
      state.current.viewDiff = undefined;
      state.current.selection = [];
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
        state.current.selection = state.current.diff?.comparisons.map(c => c.id) ?? [];
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
        state.current.diff = {
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
      state.current.diff = {
        loading: false,
        comparisons: action.payload.comparisons,
      };
    },
  },
});

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
  const comparison = state.current.diff?.comparisons.find(c => c.id === id);
  if (!comparison || !comparison.isMatch) return undefined;
  return comparison;
};

export const selectIsComparisonSelected = (state: CompareState, id: string): boolean => {
  return state.current.selection.some(comparisonId => comparisonId === id);
};

export const selectIsAllComparisonSelected = (state: CompareState): boolean => {
  return !state.current.diff?.loading && state.current.selection.length === state.current.diff?.comparisons.length;
};

/* * * * * * * * * * * * * *
 * Listeners
 * * * * * * * * * * * * * */
startAppListening({
  matcher: isAnyOf(resourceSetSelected, resourceSetRefreshed, resourceSetCleared),
  effect: async (action, {dispatch, delay, cancelActiveListeners}) => {
    const side = (action as any).payload.side;
    if (side === 'right') return;
    cancelActiveListeners();
    if (resourceSetCleared.match(action)) return;

    try {
      console.log('fetching resources for left...', {trigger: action.type, side});
      await delay(150);

      if (Math.random() > 0.75) {
        dispatch(resourceSetFetchFailed({side: 'left', reason: 'forced error'}));
        return;
      }

      const resources = times(40, () => basicDeploymentFixture());

      dispatch(resourceSetFetched({side: 'left', resources}));
    } catch (err) {
      if (err instanceof TaskAbortError) return;
      const reason = err instanceof Error ? err.message : 'unknown failure';
      dispatch(resourceSetFetchFailed({side: 'left', reason}));
    }
  },
});

startAppListening({
  matcher: isAnyOf(resourceSetSelected, resourceSetRefreshed, resourceSetCleared),
  effect: async (action, {dispatch, delay, cancelActiveListeners}) => {
    const side = (action as any).payload.side;
    if (side === 'left') return;
    cancelActiveListeners();
    if (resourceSetCleared.match(action)) return;

    try {
      console.log('fetching resources for right...', {trigger: action.type, side});
      await delay(150);

      if (Math.random() > 0.75) {
        dispatch(resourceSetFetchFailed({side: 'right', reason: 'forced error'}));
        return;
      }

      const resources = times(40, () => basicDeploymentFixture());

      dispatch(resourceSetFetched({side: 'right', resources}));
    } catch (err) {
      if (err instanceof TaskAbortError) return;
      const reason = err instanceof Error ? err.message : 'unknown failure';
      dispatch(resourceSetFetchFailed({side: 'right', reason}));
    }
  },
});

startAppListening({
  actionCreator: resourceSetFetched,
  effect: async (action, {dispatch, delay, getState}) => {
    const status = selectCompareStatus(getState().compare);
    if (status !== 'comparing') return;

    await delay(400);

    const comparisons: ResourceComparison[] = [
      {
        id: faker.datatype.uuid(),
        isMatch: true,
        left: basicDeploymentFixture(),
        right: basicDeploymentFixture(), // not actually a match but it suffices..
        isDifferent: true,
      },
      {
        id: faker.datatype.uuid(),
        isMatch: true,
        left: basicDeploymentFixture(),
        right: basicDeploymentFixture(), // not actually a match but it suffices..
        isDifferent: false,
      },
      {id: faker.datatype.uuid(), isMatch: false, left: basicDeploymentFixture(), right: undefined},
      {id: faker.datatype.uuid(), isMatch: false, left: undefined, right: basicDeploymentFixture()},
    ];

    dispatch(resourceSetCompared({comparisons}));
  },
});
