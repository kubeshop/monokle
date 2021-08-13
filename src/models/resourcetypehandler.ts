import * as k8s from '@kubernetes/client-node';
import {monaco} from 'react-monaco-editor';

interface SymbolPathMatcher {
  path?: string[];
  isMatch?(symbols: monaco.languages.DocumentSymbol[]): boolean;
}

interface OutgoingRefMapper {
  source: {
    path: string;
  };
  target: {
    resourceKind: string;
    path: string;
  };
  matchPairs?: boolean;
}

interface ResourceTypeHandler {
  /**
   * The kubernetes kind of this resource
   */

  kind: string;

  /**
   * a standard matcher for selecting resources of this kind
   */

  apiVersionMatcher: string;

  /**
   * A user friendly description of this resource type
   */

  description: string;

  /**
   * Retrieve the specified resource of this type using the provided kubeconfig
   */

  getResourceFromCluster(name: string, namespace: string, kubeconfig: k8s.KubeConfig): Promise<any>;

  /**
   * Get all resources of this type using the provided kubeconfig
   */

  listResourcesInCluster(kubeconfig: k8s.KubeConfig): Promise<any[]>;

  /**
   * optional outgoing RefMappers to use for resolving refs in resources of this type
   */

  outgoingRefMapper?: OutgoingRefMapper[];

  /**
   * The desired navigator section and subsection for this resource type
   */

  navigatorPath: [sectionName: string, subsectionName: string];

  /**
   * optional JSON Schema and symbol-matchers to pass to the source editor
   */

  sourceEditorOptions?: {
    editorSchema?: any;
    symbolPathMatchers?: SymbolPathMatcher[];
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
}

export type {ResourceTypeHandler};
