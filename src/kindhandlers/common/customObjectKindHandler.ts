import * as k8s from '@kubernetes/client-node';

import {cloneDeep} from 'lodash';
import log from 'loglevel';
import path from 'path';

import navSectionNames from '@constants/navSectionNames';

import {K8sResource} from '@models/k8sresource';
import {RefMapper, ResourceKindHandler} from '@models/resourcekindhandler';

import {loadResource} from '@redux/services';
import {extractSchema} from '@redux/services/schema';
import {findDefaultVersion} from '@redux/thunks/previewCluster';

import {
  explicitNamespaceMatcher,
  implicitNamespaceMatcher,
  optionalExplicitNamespaceMatcher,
  targetGroupMatcher,
  targetKindMatcher,
} from '@src/kindhandlers/common/customMatchers';
import {createPodSelectorOutgoingRefMappers} from '@src/kindhandlers/common/outgoingRefMappers';

/**
 * extract the version from the apiVersion string of the specified resource
 */

function extractResourceVersion(resource: K8sResource, kindVersion: string, kindGroup: string) {
  const ix = resource.version.lastIndexOf('/');
  const version = ix > 0 ? resource.version.substring(ix + 1) : kindVersion;
  const group = ix > 0 ? resource.version.substring(0, ix) : kindGroup;
  return {version, group};
}

export function extractFormSchema(editorSchema: any) {
  const schema: any = cloneDeep(editorSchema);
  if (schema && schema.properties) {
    // remove common object properties since these are shown in a separate form
    delete schema.properties['apiVersion'];
    delete schema.properties['kind'];
    delete schema.properties['metadata'];

    // delete incomplete properties at root level, see sealed-secret.yaml
    Object.keys(schema.properties).forEach(key => {
      // property without type?
      if (!schema.properties[key].type) {
        delete schema.properties[key];
      }
      // object without properties?
      else if (schema.properties[key].type === 'object' && !schema.properties[key].properties) {
        delete schema.properties[key];
      }
    });
  }

  return schema;
}

function extractNamespaceMatchers(refMapper: any) {
  switch (refMapper.source?.namespaceRef) {
    case 'Implicit':
      refMapper.source.siblingMatchers = {
        namespace: implicitNamespaceMatcher,
      };
      break;
    case 'Explicit':
      refMapper.source.siblingMatchers = {
        namespace: explicitNamespaceMatcher,
      };
      break;
    case 'OptionalExplicit':
      refMapper.source.siblingMatchers = {
        namespace: optionalExplicitNamespaceMatcher,
      };
      break;
    default:
  }
}

function extractSiblingMatchers(refMapper: any) {
  if (!refMapper.source.siblingMatchers) {
    refMapper.source.siblingMatchers = {};
  }

  refMapper.source.matchers.forEach((m: any) => {
    switch (m) {
      case 'kindMatcher':
        refMapper.source.siblingMatchers['kind'] = targetKindMatcher;
        break;
      case 'groupMatcher':
        refMapper.source.siblingMatchers['group'] = targetGroupMatcher;
        break;
      default:
        break;
    }
  });
}

export function extractKindHandler(crd: any, handlerPath?: string) {
  if (!crd?.spec) {
    return;
  }

  const spec = crd.spec;
  const kind = spec.names.kind;
  const kindGroup = spec.group;
  const kindVersion = findDefaultVersion(crd);

  if (kindVersion) {
    const kindPlural = spec.names.plural;
    let editorSchema = kindVersion ? extractSchema(crd, kindVersion) : undefined;
    let kindHandler: ResourceKindHandler | undefined;
    let helpLink: string | undefined;
    let refMappers: any[] = [];
    let subsectionName = spec.group;
    let kindSectionName = spec.names.plural;

    if (handlerPath) {
      try {
        const handlerContent = loadResource(`${handlerPath}${path.sep}${kindGroup}${path.sep}${kind}.json`);

        if (handlerContent) {
          const handler = JSON.parse(handlerContent);
          if (handler) {
            helpLink = handler.helpLink;
            subsectionName = handler.sectionName || subsectionName;
            kindSectionName = handler.kindSectionName || kindSectionName;

            if (handler.refMappers) {
              handler.refMappers.forEach((refMapper: any) => {
                if (refMapper.source?.namespaceRef) {
                  extractNamespaceMatchers(refMapper);
                }

                if (refMapper.source?.matchers) {
                  extractSiblingMatchers(refMapper);
                }

                refMappers.push(refMapper);
              });
            }

            if (handler.podSelectors) {
              handler.podSelectors.forEach((selector: string[]) => {
                refMappers.push(...createPodSelectorOutgoingRefMappers(selector));
              });
            }

            if (handler.editorSchema) {
              editorSchema = handler.editorSchema;
            }
          }
        }
      } catch (e) {
        log.warn(`Failed to parse kindhandler`, e);
      }
    }

    if (spec.scope === 'Namespaced') {
      kindHandler = createNamespacedCustomObjectKindHandler(
        kind,
        subsectionName,
        kindSectionName,
        kindGroup,
        kindVersion,
        kindPlural,
        editorSchema,
        helpLink,
        refMappers
      );
    } else if (spec.scope === 'Cluster') {
      kindHandler = createClusterCustomObjectKindHandler(
        kind,
        subsectionName,
        kindSectionName,
        kindGroup,
        kindVersion,
        kindPlural,
        editorSchema,
        helpLink,
        refMappers
      );
    }

    return kindHandler;
  }
}

const createNamespacedCustomObjectKindHandler = (
  kind: string,
  subsectionName: string,
  kindSectionName: string,
  kindGroup: string,
  kindVersion: string,
  kindPlural: string,
  editorSchema?: any,
  helpLink?: string,
  outgoingRefMappers?: RefMapper[]
): ResourceKindHandler => {
  return {
    kind,
    apiVersionMatcher: `${kindGroup}/*`,
    navigatorPath: [navSectionNames.K8S_RESOURCES, subsectionName, kindSectionName],
    clusterApiVersion: `${kindGroup}/${kindVersion}`,
    isCustom: true,
    helpLink,
    outgoingRefMappers,
    sourceEditorOptions: editorSchema ? {editorSchema} : undefined,
    formEditorOptions: editorSchema ? {editorSchema: extractFormSchema(editorSchema)} : undefined,
    getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
      const {version, group} = extractResourceVersion(resource, kindVersion, kindGroup);

      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
      return customObjectsApi.getNamespacedCustomObject(
        group,
        version,
        resource.namespace || 'default',
        kindPlural,
        resource.name
      );
    },
    async listResourcesInCluster(kubeconfig: k8s.KubeConfig, crd?: K8sResource) {
      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

      if (crd) {
        const defaultVersion = findDefaultVersion(crd.content);
        if (defaultVersion) {
          return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
        }
      }

      // need to find which versions that are in cluster to find default version
      const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
      const crdName = `${kindPlural}.${kindGroup}`;
      try {
        const result = await k8sCoreV1Api.readCustomResourceDefinition(crdName).then(
          response => {
            const defaultVersion = findDefaultVersion(response.body);
            // use listClusterCustomObject to get objects in all namespaces
            return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
          },
          () => {
            log.warn(`Failed to get CRD for ${crdName}, ignoring`);
            return [];
          }
        );

        // @ts-ignore
        return result.body?.items || [];
      } catch (e) {
        log.warn(`error retrieving ${kindSectionName}`, e);
        return [];
      }
    },
    async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
      const {version, group} = extractResourceVersion(resource, kindVersion, kindGroup);

      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
      await customObjectsApi.deleteNamespacedCustomObject(
        group,
        version,
        resource.namespace || 'default',
        kindPlural,
        resource.name
      );
    },
  };
};

const createClusterCustomObjectKindHandler = (
  kind: string,
  subsectionName: string,
  kindSectionName: string,
  kindGroup: string,
  kindVersion: string,
  kindPlural: string,
  editorSchema?: any,
  helpLink?: string,
  outgoingRefMappers?: RefMapper[]
): ResourceKindHandler => {
  return {
    kind,
    apiVersionMatcher: `${kindGroup}/*`,
    navigatorPath: [navSectionNames.K8S_RESOURCES, subsectionName, kindSectionName],
    clusterApiVersion: `${kindGroup}/${kindVersion}`,
    helpLink,
    outgoingRefMappers,
    isCustom: true,
    sourceEditorOptions: editorSchema ? {editorSchema} : undefined,
    formEditorOptions: editorSchema ? {editorSchema: extractFormSchema(editorSchema)} : undefined,
    getResourceFromCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource): Promise<any> {
      const {version, group} = extractResourceVersion(resource, kindVersion, kindGroup);

      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
      return customObjectsApi.getClusterCustomObject(group, version, kindPlural, resource.name);
    },
    async listResourcesInCluster(kubeconfig: k8s.KubeConfig, crd?: K8sResource) {
      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);

      if (crd) {
        const defaultVersion = findDefaultVersion(crd.content);
        if (defaultVersion) {
          return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
        }
      }
      // need to find which versions that are in cluster to find default version
      const k8sCoreV1Api = kubeconfig.makeApiClient(k8s.ApiextensionsV1Api);
      const crdName = `${kindPlural}.${kindGroup}`;
      try {
        const result = await k8sCoreV1Api.readCustomResourceDefinition(crdName).then(
          response => {
            const defaultVersion = findDefaultVersion(response.body);
            return customObjectsApi.listClusterCustomObject(kindGroup, defaultVersion || kindVersion, kindPlural);
          },
          () => {
            log.warn(`Failed to get CRD for ${crdName}, ignoring`);
            return [];
          }
        );

        // @ts-ignore
        return result.body?.items || [];
      } catch (e) {
        log.warn(`error retrieving ${kindSectionName}`, e);
        return [];
      }
    },
    async deleteResourceInCluster(kubeconfig: k8s.KubeConfig, resource: K8sResource) {
      const {version, group} = extractResourceVersion(resource, kindVersion, kindGroup);

      const customObjectsApi = kubeconfig.makeApiClient(k8s.CustomObjectsApi);
      await customObjectsApi.deleteClusterCustomObject(group, version, kindPlural, resource.name);
    },
  };
};
