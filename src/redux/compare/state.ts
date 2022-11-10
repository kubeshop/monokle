import {K8sResource} from '@monokle-desktop/shared';

export const initialState: CompareState = {
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

export type CompareState = {
  /**
   * The currently viewed comparison.
   */
  current: {
    /**
     * The view configuration.
     */
    view: ComparisonView | SavedComparisonView;

    /**
     * Resources of the left side.
     */
    left?: ResourceSetData;

    /**
     * Resources of the right side.
     */
    right?: ResourceSetData;

    /**
     * Comparisons between left and right resources.
     */
    comparison?: ComparisonData;

    /**
     * A list of identifiers of comparisons.
     */
    selection: string[];

    /**
     * When set it will let you inspect the comparison.
     */
    inspect?: ComparisonInspection;

    /**
     * Filters resources by name.
     */
    search?: string;

    /**
     * A list of comparisons that remain after filtering.
     */
    filtering?: {
      pending: boolean;
      comparisons: ResourceComparison[];
    };

    /**
     * State of the transfer resource action.
     */
    transfering: {
      pending: boolean;
    };
  };
};

export type CompareStatus = 'selecting' | 'comparing' | 'inspecting' | 'transfering';
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
  /**
   * The resource set definition of the left side.
   *
   * @remarks Updating this will trigger `fetch`.
   */
  leftSet?: PartialResourceSet;

  /**
   * The resource set definition of the right side.
   *
   * @remarks Updating this will trigger `fetch`.
   */
  rightSet?: PartialResourceSet;

  /**
   * The comparison strategy.
   *
   * @remarks Updating this will trigger `compare`.
   */
  operation?: CompareOperation;

  /**
   * The filter configuration.
   *
   * @remarks Updating this will trigger `filter`.
   */
  filter?: CompareFilter;

  /**
   * The default namespace.
   *
   * @remarks Only updates resource withou a namespace, those with `namespace: 'default'` will not be updated.
   * @remarks Updating this will trigger `compare`.
   */
  namespace?: string;
};

export type SavedComparisonView = ComparisonView & {
  name: string;
  viewedAt: Date;
};

export type PartialResourceSet = Pick<ResourceSet, 'type'> & Partial<ResourceSet>;
export type ResourceSet =
  | LocalResourceSet
  | KustomizeResourceSet
  | HelmResourceSet
  | CustomHelmResourceSet
  | ClusterResourceSet
  | GitResourceSet
  | CommandResourceSet;

export type LocalResourceSet = {
  type: 'local';
  defaultNamespace?: string;
};

export type KustomizeResourceSet = {
  type: 'kustomize';
  kustomizationId: string;
  defaultNamespace?: string;
};

export type GitResourceSet = {
  type: 'git';
  branchName: string;
  commitHash?: string;
};

export type CommandResourceSet = {
  type: 'command';
  commandId: string;
};

export type HelmResourceSet = {
  type: 'helm';
  chartId: string;
  valuesId: string;
  defaultNamespace?: string;
};

export type CustomHelmResourceSet = {
  type: 'helm-custom';
  chartId: string;
  configId: string;
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

export type MatchingResourceComparison = {
  // appears in intersection | union
  id: string;
  isMatch: true;
  isDifferent: boolean;
  left: K8sResource;
  right: K8sResource;
};
