import {Document, LineCounter, ParsedNode, Scalar} from 'yaml';

export type RefNode = {scalar: Scalar; key: string; parentKeyPath: string};

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
  filePath: string;
  /**
   * name - generated from manifest metadata
   */
  name: string;
  /** k8s resource kind */
  kind: string;
  /** k8s resource version */
  version: string;
  /** k8s namespace is specified (for filtering) */
  namespace?: string;
  /** if highlighted in UI (should probalby move to UI state object) */
  isHighlighted: boolean;
  /** if selected in UI (should probably move to UI state object) */
  isSelected: boolean;
  /** unparsed resource content (for editing) */
  text: string;
  /**  contains parsed yaml resource - used for filtering/finding links/refs, etc */
  content: any;
  /** array of refs (incoming, outgoing and unsatisfied) to and from other resources */
  refs?: ResourceRef[];
  /**  range of this resource in a multidocument file */
  range?: {
    start: number;
    length: number;
  };

  /** temporary object used for parsing refs */
  parsedDoc?: Document.Parsed<ParsedNode>;
  /** temporary object used for ref positioning */
  lineCounter?: LineCounter;
  /** temporary object used for parsing refs */
  refNodeByPath?: Record<string, RefNode>;
}

export enum ResourceRefType {
  Incoming = 'incoming',
  Outgoing = 'outgoing',
  Unsatisfied = 'unsatisfied-outgoing',
}

interface ResourceRef {
  /** the type of ref (see enum) */
  type: ResourceRefType;
  /** the ref value - for example the name of a configmap */
  name: string;
  /** the resource this is referring to (empty for unsatisfied refs) */
  targetResourceId?: string;
  /** the resource kind of the target resource */
  targetResourceKind?: string;
  /** the position in the document of the refName (undefined for incoming file refs) */
  position?: RefPosition;
}

interface RefPosition {
  line: number;
  column: number;
  length: number;
}

export type {K8sResource, ResourceRef, RefPosition};
