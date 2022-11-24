import * as k8s from '@kubernetes/client-node';

import {ResourceMeta} from './k8sResource';

type ClusterResourceOptions = {
  namespace?: string;
};

type ResourceKindHandler = {
  /**
   * The kubernetes kind of this resource
   */

  kind: string;

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

  getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: ResourceMeta): Promise<any>;

  /**
   * Get all resources of this type using the provided kubeconfig
   */

  listResourcesInCluster(
    kubeconfig: k8s.KubeConfig,
    options: ClusterResourceOptions,
    crd?: ResourceMeta
  ): Promise<any[]>;

  /**
   * Delete the specified resource from the cluster
   */

  deleteResourceInCluster: (kubeconfig: k8s.KubeConfig, resource: ResourceMeta) => Promise<void>;

  /**
   * The desired navigator section and subsection for this resource type,
   * if not specified, the resource will appear in an existing subsection
   * which has the kindSelector equal to the resource kind
   */

  navigatorPath: [navigatorName: string, sectionName: string, subsectionName: string];

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
};

export type {ClusterResourceOptions, ResourceKindHandler};
