import * as k8s from '@kubernetes/client-node';

import {monaco} from 'react-monaco-editor';

interface SymbolMatcher {
  isMatch?(symbols: monaco.languages.DocumentSymbol[]): boolean;
}

export enum NamespaceRefTypeEnum {
  None, // ignore namespaces for this ref
  Implicit, // use the namespace of the containing resource
  Explicit, // target namespace property expected
  OptionalExplicit, // if no namespace is provided then use the namespace of the containing resource
}

interface RefMapper {
  source: {
    pathParts: string[];
    hasOptionalSibling?: boolean;
    namespaceRef?: NamespaceRefTypeEnum;
    namespaceProperty?: string; // default to "namespace"
  };
  target: {
    kind: string;
    pathParts: string[];
  };
  matchPairs?: boolean;
}

interface ResourceKindHandler {
  /**
   * The kubernetes kind of this resource
   */

  kind: string;

  /**
   * a standard matcher for selecting resources of this kind
   */

  apiVersionMatcher: string;

  /**
   * API version used by cluster preview
   */

  clusterApiVersion: string;

  /**
   * A user friendly description of this resource type
   */

  description: string;

  /**
   * Retrieve the specified resource of this type using the provided kubeconfig
   */

  getResourceFromCluster(kubeconfig: k8s.KubeConfig, name: string, namespace: string): Promise<any>;

  /**
   * Get all resources of this type using the provided kubeconfig
   */

  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]>;

  deleteResourceInCluster: (kubeconfig: k8s.KubeConfig, name: string, namespace?: string) => Promise<void>;

  /**
   * optional outgoing RefMappers to use for resolving refs in resources of this type
   */

  outgoingRefMappers?: RefMapper[];

  /**
   * The desired navigator section and subsection for this resource type,
   * if not specified, the resource will appear in an existing subsection
   * which has the kindSelector equal to the resource kind
   */

  navigatorPath: [navigatorName: string, sectionName: string, subsectionName: string];

  /**
   * optional JSON Schema and symbol-matchers to pass to the source editor
   */

  sourceEditorOptions?: {
    editorSchema?: any;
    symbolMatchers?: SymbolMatcher[];
  };

  /**
   * optional form editor options; if undefined no form editor will be shown
   */

  formEditorOptions?: {
    editorSchema: any;
    editorUiSchema: any;
  };

  /**
   * optional additional editors/views to show in the actionspane
   */

  actionTabs?: {
    name: string;
    description: string;
    component: React.ComponentType;
  }[];

  /**
   * An optional list of templates presented to users when creating a new resource of this kind.
   */

  templates?: {
    name: string;
    description: string;
    content: string;
  }[];

  validationSchemaPrefix?: string;
}

export type {ResourceKindHandler, RefMapper, SymbolMatcher};
