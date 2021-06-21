interface K8sResource {
  id: string,
  path: string,
  name: string,
  kind: string,
  version: string,
  namespace?: string,
  highlight: boolean,
  selected: boolean,
  content: any, // contains parsed yaml resource - used for filtering/etc
  refs?: ResourceRef[], // array of refs to other resources
  linePos: number, // line position in yaml file of this resource
  docIndex: number // index of this resources yaml Document
}

export enum ResourceRefType {
  KustomizationResource,
  KustomizationParent,
  ServicePodSelector,
  SelectedPodName,
  ConfigMapRef,
  ConfigMapConsumer
}

interface ResourceRef {
  targetResourceId: string,
  refType: ResourceRefType
}

export type {
  K8sResource, ResourceRef,
};
