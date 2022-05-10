import {K8sResource} from '@models/k8sresource';

export type FakeStore = {
  main: FakeMainState;
};

export type FakeMainState = {
  diff: Diff;
  deviceId: string;
};

export type Diff = {
  views: SavedDiffView[];
  current: {
    view: DiffView | SavedDiffView;
    left?: ResourceSetData;
    right?: ResourceSetData;
    diff?: DiffData;
    selection: string[];
  };
};

export type DiffData = {
  loading: boolean;
  comparisons: ResourceComparison[];
};

export type ResourceSetData = {
  loading: boolean;
  error: boolean;
  resources: K8sResource[];
};

export type DiffView = {
  leftSet: ResourceSet | undefined;
  rightSet: ResourceSet | undefined;
  operation: 'union' | 'intersection' | 'symmetricDifference' | 'leftDifference' | 'rightDifference';
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
