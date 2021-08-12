/**
 * A k8s resource manifest, either extracted from a file or generated internally (for example when previewing kustomizations or helm charts)
 */
import {Document, LineCounter, ParsedNode, Scalar} from 'yaml';

export type RefNode = {scalar: Scalar; key: string; parentKeyPath: string};

interface K8sResource {
  id: string; // an internally generated UUID - used for references/lookups in resourceMap
  filePath: string; // the path relative to the root folder to the file containing this resource - set to preview://<id> for internally generated resources
  name: string; // name - generated from manifest metadata
  kind: string; // k8s resource kind
  version: string; // k8s resource version
  namespace?: string; // k8s namespace is specified (for filtering)
  isHighlighted: boolean; // if highlighted in UI (should probalby move to UI state object)
  isSelected: boolean; // if selected in UI (should probably move to UI state object)
  text: string; // unparsed resource content (for editing)
  content: any; // contains parsed yaml resource - used for filtering/finding links/refs, etc
  refs?: ResourceRef[]; // array of refs to other resources
  range?: {
    // range of this resource in a multidocument file
    start: number;
    length: number;
  };

  parsedDoc?: Document.Parsed<ParsedNode>; // temporary object used for parsing refs
  lineCounter?: LineCounter; // temporary object used for ref positioning
  refNodeByPath?: Record<string, RefNode>;
}

export enum ResourceRefType {
  ConfigMapRef,
  ConfigMapConsumer,
  ClusterRoleConsumer,
  ClusterRoleRef,
  ClusterRoleBindingConsumer,
  ClusterRoleBindingRef,
  KustomizationResource,
  KustomizationParent,
  PersistentVolumeConsumer,
  PersistentVolumeRef,
  PersistentVolumeClaimConsumer,
  PersistentVolumeClaimRef,
  RoleConsumer,
  RoleRef,
  SecretRef,
  SecretConsumer,
  ServiceConsumer,
  ServiceRef,
  ServiceAccountRef,
  ServiceAccountConsumer,
  ServicePodSelector,
  SelectedPodName,
  UnsatisfiedConfigMap,
  UnsatisfiedClusterRole,
  UnsatisfiedClusterRoleBinding,
  UnsatisfiedPersistentVolumeClaim,
  UnsatisfiedPersistentVolume,
  UnsatisfiedRole,
  UnsatisfiedSelector,
  UnsatisfiedSecret,
  UnsatisfiedService,
  UnsatisfiedServiceAccount,
}

interface ResourceRef {
  type: ResourceRefType; // the type of ref (see enum)
  name: string; // the ref value - for example the name of a configmap
  targetResource?: string; // the resource this is referring to (empty for unsatisfied refs)
  refPos?: RefPosition; // the position in the document of the refName (undefined for incoming file refs)
}

interface RefPosition {
  line: number;
  column: number;
  length: number;
}

export type {K8sResource, ResourceRef, RefPosition};
