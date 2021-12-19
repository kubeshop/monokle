import * as k8s from '@kubernetes/client-node';

import {monaco} from 'react-monaco-editor';

import {K8sResource} from '@models/k8sresource';

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
    pathParts?: string[];
  };

  type: 'path' | 'name' | 'pairs';
}

export type ResourceKind = string;
interface ResourceKindHandler {
  /**
   * The kubernetes kind of this resource
   */

  kind: ResourceKind;

  /**
   * a standard matcher for selecting resources of this kind
   */

  apiVersionMatcher: string;

  /**
   * API version used by cluster preview
   */

  clusterApiVersion: string;

  /**
   * An external link to documentation
   */

  helpLink?: string;

  /**
   * Retrieve the specified resource of this type using the provided kubeconfig
   */

  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any>;

  /**
   * Get all resources of this type using the provided kubeconfig
   */

  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]>;

  /**
   * Delete the specified resource from the cluster
   */

  deleteResourceInCluster: (kubeconfig: k8s.KubeConfig, resource: K8sResource) => Promise<void>;

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

  validationSchemaPrefix?: string;
}

export type {ResourceKindHandler, RefMapper, SymbolMatcher};
