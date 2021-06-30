/**
 * A k8s resource manifest, either extracted from a file or generated internaally (for example when previewing kustomizations)
 */

interface K8sResource {
  id: string; // an internally generated UUID - used for references/lookups in resourceMap
  filePath: string; // the path relative to the root folder to the file containing this resource - set to preview://<id> for internally generated resources
  name: string; // name - generated from manifest metadata
  kind: string; // k8s resource kind
  version: string; // k8s resource version
  namespace?: string; // k8s namespace is specified (for filtering)
  highlight: boolean; // if highlighted in UI (should probalby move to UI state object)
  selected: boolean; // if selected in UI (should probably move to UI state object)
  text: string; // unparsed resource content (for editing)
  content: any; // contains parsed yaml resource - used for filtering/finding links/refs, etc
  refs?: ResourceRef[]; // array of refs to other resources
  range?: {
    start: number;
    length: number;
  }; // range of this resource in a multidocument file
}

export enum ResourceRefType {
  KustomizationResource,
  KustomizationParent,
  ServicePodSelector,
  SelectedPodName,
  ConfigMapRef,
  ConfigMapConsumer,
  UnsatisfiedSelector,
  UnsatisfiedConfigMap,
}

interface ResourceRef {
  target: string;
  refType: ResourceRefType;
}

export type {K8sResource, ResourceRef};
