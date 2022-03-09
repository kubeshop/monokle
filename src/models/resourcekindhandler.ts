import * as k8s from '@kubernetes/client-node';

import {monaco} from 'react-monaco-editor';

import {K8sResource} from '@models/k8sresource';

interface SymbolMatcher {
  isMatch?(symbols: monaco.languages.DocumentSymbol[]): boolean;
}

interface RefMapper {
  source: {
    pathParts: string[];

    // sibling matchers that will be used to validate this ref
    siblingMatchers?: Record<
      string,
      (
        sourceResource: K8sResource,
        targetResource: K8sResource,
        value: string,
        siblingValues: Record<string, string>
      ) => boolean
    >;

    // optionally checks for an 'optional' sibling to validate ref
    isOptional?: boolean;
  };
  target: {
    kind: string;
    pathParts?: string[];
  };

  type: 'path' | 'name' | 'pairs';

  // called to validate if an unsatisfied ref should be created for this mapper
  shouldCreateUnsatisfiedRef?: (
    refMapper: RefMapper,
    sourceResource: K8sResource,
    siblingValues: Record<string, string>
  ) => boolean;
}

export type ResourceKind = string;

export type ClusterResourceOptions = {
  namespace?: string;
};

interface ResourceKindHandler {
  /**
   * The kubernetes kind of this resource
   */

  kind: ResourceKind;

  /**
   * a micromatch matcher for selecting resources of this kind
   */

  apiVersionMatcher: string;

  /**
   * If this resource kind is namespaced
   */

  isNamespaced: boolean;

  /**
   * API version used by cluster preview
   */

  clusterApiVersion: string;

  /**
   * tells if this kind is a custom resource
   */

  isCustom: boolean;

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

  listResourcesInCluster(
    kubeconfig: k8s.KubeConfig,
    options: ClusterResourceOptions,
    crd?: K8sResource
  ): Promise<any[]>;

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
   * optional JSON Schema for validation and symbol-matchers to pass to the source editor
   */

  sourceEditorOptions?: {
    editorSchema: any;
    symbolMatchers?: SymbolMatcher[];
  };

  /**
   * optional form editor options; if undefined no form editor will be shown
   */

  formEditorOptions?: {
    editorSchema: any;
    editorUiSchema?: any;
  };

  /**
   * Only set for native kubernetes resources - used for extracting the corresponding resource schema from
   * file containing all schemas
   */

  validationSchemaPrefix?: string;
}

export type {ResourceKindHandler, RefMapper, SymbolMatcher};
