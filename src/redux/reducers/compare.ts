import {PayloadAction, createSlice, isAnyOf} from '@reduxjs/toolkit';

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
  | {
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
      if (['left', 'both'].includes(side)) {
        state.current.view.leftSet = undefined;
        state.current.left = undefined;
        state.current.diff = undefined;
      }
      if (['right', 'both'].includes(side)) {
        state.current.view.rightSet = undefined;
        state.current.right = undefined;
        state.current.diff = undefined;
      }
    },
    resourceSetRefreshed: (state, action: PayloadAction<{side: CompareSide}>) => {
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
} = compareSlice.actions;

/* * * * * * * * * * * * * *
 * Selectors
 * * * * * * * * * * * * * */
export type CompareStatus = 'selecting' | 'comparing' | 'compared';
export const selectCompareStatus = (state: CompareState): CompareStatus => {
  const c = state.current;

  const empty = !c.left && !c.right;
  const leftSuccess = c.left && !c.left.loading && !c.left.error;
  const rightSuccess = c.right && !c.right.loading && !c.right.error;
  if (empty || !leftSuccess || !rightSuccess) {
    return 'selecting';
  }

  const diffSuccess = c.diff && !c.diff.loading;
  return diffSuccess ? 'compared' : 'comparing';
};

/* * * * * * * * * * * * * *
 * Listeners
 * * * * * * * * * * * * * */
startAppListening({
  matcher: isAnyOf(resourceSetSelected, resourceSetRefreshed),
  effect: async (action, {dispatch, delay}) => {
    const side = (action as any).payload.side;
    try {
      console.log('fetching resources...', {trigger: action.type, side});
      await delay(2000);

      const resources = times(20, () => basicDeploymentFixture());

      dispatch(resourceSetFetched({side, resources}));
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown failure';
      dispatch(resourceSetFetchFailed({side, reason}));
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
