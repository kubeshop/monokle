import * as k8s from '@kubernetes/client-node';

import {monaco} from 'react-monaco-editor';

import {JsonObject} from 'type-fest';

import {K8sResource} from '@models/k8sresource';

interface SymbolMatcher {
  isMatch?(symbols: monaco.languages.DocumentSymbol[]): boolean;
}

interface RefMapper {
  source: {
    pathParts: string[];

    // sibling matchers that will be used to validate this ref, maps the name of a sibling property to
    // a function that validates if the corresponding property value is a valid match
    siblingMatchers?: Record<
      string, // name of the property to match, for example 'kind'
      (
        sourceResource: K8sResource,
        targetResource: K8sResource,
        value: string, // the actual value of the property to be matched
        siblingValues: Record<string, string>, // a map of all sibling property values
        properties?: JsonObject // optional configuration properties passed to matcher (see below)
      ) => boolean // function that controls if the specified value
    >;

    // optional matcher configuration properties that will be passed to each correspondingly named matcher
    matcherProperties?: Record<string, JsonObject>;

    // optionally checks for an 'optional' sibling to validate ref
    isOptional?: boolean;
  };
  target: {
    kind: string;
    pathParts?: string[];
  };

  type: 'path' | 'name' | 'pairs' | 'image';

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
  watcherReq?: any;
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
   * Watch all resources of this type using the provided kubeconfig and dispatch to store
   */

  watchResources(
    dispatch: any,
    kubeconfig: k8s.KubeConfig,
    options: ClusterResourceOptions,
    crd?: K8sResource
  ): Promise<any[]>;

  /**
   * Delete listeners on stop preview
   */

  disconnectFromCluster(): void;

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
