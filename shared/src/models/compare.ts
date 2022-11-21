import {K8sResource} from './k8sResource';

type CompareState = {
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

type CompareFilter = {
  namespace?: string;
  kind?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

type CompareOperation = 'union' | 'intersection' | 'symmetricDifference' | 'leftJoin' | 'rightJoin';

type CompareSide = 'left' | 'right';

type CompareStatus = 'selecting' | 'comparing' | 'inspecting' | 'transfering';

type ComparisonData = {
  loading: boolean;
  comparisons: ResourceComparison[];
};

type ComparisonListItem = HeaderItemProps | ComparisonItemProps;

type ComparisonInspection = {
  comparison: string;
  type: CompareSide | 'diff';
};

type ComparisonItemProps = {
  type: 'comparison';
  id: string;
  leftNamespace?: string | undefined;
  rightNamespace?: string | undefined;
  namespace?: string | undefined;
  name: string;
  leftActive: boolean;
  leftTransferable: boolean;
  rightActive: boolean;
  rightTransferable: boolean;
  canDiff: boolean;
  kind: string;
};

type ComparisonView = {
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

type ClusterResourceSet = {
  type: 'cluster';
  context: string;
};

type CustomHelmResourceSet = {
  type: 'helm-custom';
  chartId: string;
  configId: string;
  defaultNamespace?: string;
};

type CommandResourceSet = {
  type: 'command';
  commandId: string;
};

type GitResourceSet = {
  type: 'git';
  branchName: string;
  commitHash?: string;
};

type HeaderItemProps = {
  type: 'header';
  kind: string;
  count: number;
};

type HelmResourceSet = {
  type: 'helm';
  chartId: string;
  valuesId: string;
  defaultNamespace?: string;
};

type KustomizeResourceSet = {
  type: 'kustomize';
  kustomizationId: string;
  defaultNamespace?: string;
};

type LocalResourceSet = {
  type: 'local';
  defaultNamespace?: string;
};

type MatchingResourceComparison = {
  // appears in intersection | union
  id: string;
  isMatch: true;
  isDifferent: boolean;
  left: K8sResource;
  right: K8sResource;
};

type PartialResourceSet = Pick<ResourceSet, 'type'> & Partial<ResourceSet>;

type ResourceComparison =
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

type ResourceSet =
  | LocalResourceSet
  | KustomizeResourceSet
  | HelmResourceSet
  | CustomHelmResourceSet
  | ClusterResourceSet
  | GitResourceSet
  | CommandResourceSet;

type ResourceSetData = {
  loading: boolean;
  error: boolean;
  resources: K8sResource[];
};

type SavedComparisonView = ComparisonView & {
  name: string;
  viewedAt: Date;
};

type TransferDirection = 'left-to-right' | 'right-to-left';

export type {
  ClusterResourceSet,
  CommandResourceSet,
  CompareFilter,
  CompareOperation,
  CompareSide,
  CompareState,
  CompareStatus,
  ComparisonData,
  ComparisonListItem,
  ComparisonInspection,
  ComparisonItemProps,
  ComparisonView,
  CustomHelmResourceSet,
  GitResourceSet,
  HeaderItemProps,
  HelmResourceSet,
  KustomizeResourceSet,
  LocalResourceSet,
  MatchingResourceComparison,
  PartialResourceSet,
  ResourceComparison,
  ResourceSet,
  ResourceSetData,
  SavedComparisonView,
  TransferDirection,
};
