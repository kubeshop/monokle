interface K8sResource {
  id: string; // an internally generated UUID - used for references/lookups in resourceMap
  path: string; // the full path to the file containing this resource - set to preview://<id> for internally generated resources
  name: string; // name - generated from manifest metadata
  kind: string; // k8s resource kind
  version: string; // k8s resource version
  namespace?: string; // k8s namespace is specified (for filtering)
  highlight: boolean; // if highlighted in UI (should probalby move to UI state object)
  selected: boolean; // if selected in UI (should probably move to UI state object)
  text: string; // unparsed resource content (for editing)
  content: any; // contains parsed yaml resource - used for filtering/finding links/refs, etc
  refs?: ResourceRef[]; // array of refs to other resources
  range?: number[]; // range of this resource in a multidocument file; entries are 0:start and 1:end position
}

export enum ResourceRefType {
  KustomizationResource,
  KustomizationParent,
  ServicePodSelector,
  SelectedPodName,
  ConfigMapRef,
  ConfigMapConsumer,
}

interface ResourceRef {
  targetResourceId: string;
  refType: ResourceRefType;
}

export type {K8sResource, ResourceRef};
