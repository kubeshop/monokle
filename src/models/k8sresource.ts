import {Scalar} from 'yaml';

import {SarifRule} from '@monokle-desktop/shared';

import {KubernetesObject} from './appstate';

export type RefNode = {scalar: Scalar; key: string; parentKeyPath: string};

type ResourceValidationError = {
  property: string;
  message: string;
  errorPos?: RefPosition;
  description?: string;
  rule?: SarifRule;
};

type ResourceValidation = {
  isValid: boolean;
  errors: ResourceValidationError[];
};

/**
 * A k8s resource manifest, either extracted from a file or generated internally (for example when previewing kustomizations or helm charts)
 */
interface K8sResource {
  /** an internally generated UUID
   * - used for references/lookups in resourceMap */
  id: string;
  /** the path relative to the root folder to the file containing this resource
   * - set to preview://resourceId for internally generated resources
   * - set to unsaved://resourceId for newly created resoruces */
  fileId: string;
  filePath: string;
  fileOffset: number;
  /**
   * name - generated from manifest metadata
   */
  name: string;
  /** k8s resource kind */
  kind: string;
  /** k8s resource apiVersion value */
  apiVersion: string;
  /** k8s namespace is specified (for filtering) */
  namespace?: string;
  /** if a resource is cluster scoped ( kind is namespaced ) */
  isClusterScoped: boolean;
  /** if highlighted in UI (should probalby move to UI state object) */
  isHighlighted: boolean;
  /** if selected in UI (should probably move to UI state object) */
  isSelected: boolean;
  /** unparsed resource content (for editing) */
  text: string;
  /**  contains parsed yaml resource - used for filtering/finding links/refs, etc */
  content: KubernetesObject;
  /** array of refs (incoming, outgoing and unsatisfied) to and from other resources */
  refs?: ResourceRef[];
  /**  range of this resource in a multidocument file */
  range?: {
    start: number;
    length: number;
  };
  /** result of schema validation */
  validation?: ResourceValidation;

  /** result of policy validation */
  issues?: ResourceValidation;
}

export enum ResourceRefType {
  Incoming = 'incoming',
  Outgoing = 'outgoing',
  Unsatisfied = 'unsatisfied-outgoing',
}

type RefTargetResource = {
  type: 'resource';
  resourceId?: string;
  resourceKind?: string;
  isOptional?: boolean; // set true for satisfied refs that were optional
};

type RefTargetFile = {
  type: 'file';
  filePath: string;
};

type RefTargetImage = {
  type: 'image';
  tag: string;
};

type RefTarget = RefTargetResource | RefTargetFile | RefTargetImage;

interface ResourceRef {
  /** the type of ref (see enum) */
  type: ResourceRefType;
  /** the ref value - for example the name of a configmap */
  name: string;
  /** the target resource or file this is referring to (empty for unsatisfied refs) */
  target?: RefTarget;
  /** the position in the document of the refName (undefined for incoming file refs) */
  position?: RefPosition;
}

interface RefPosition {
  line: number;
  column: number;
  length: number;
  endLine?: number;
  endColumn?: number;
}

export type {K8sResource, ResourceRef, RefPosition, ResourceValidation, ResourceValidationError};
