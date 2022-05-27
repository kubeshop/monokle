import {K8sResource} from '@models/k8sresource';

export const initialState: CompareState = {
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
export type ResourceSet =
  | LocalResourceSet
  | KustomizeResourceSet
  | HelmResourceSet
  | CustomHelmResourceSet
  | ClusterResourceSet;

export type LocalResourceSet = {
  type: 'local';
  defaultNamespace?: string;
};

export type KustomizeResourceSet = {
  type: 'kustomize';
  kustomizationId: string;
  defaultNamespace?: string;
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
