import EventEmitter from 'events';
import fs from 'fs';
import {readdir} from 'fs/promises';
import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';
import {parseAllDocuments} from 'yaml';

import {K8sResource} from '@models/k8sresource';
import {RefMapper, ResourceKindHandler} from '@models/resourcekindhandler';

import {getStaticResourcePath} from '@redux/services';
import {refMapperMatchesKind} from '@redux/services/resourceRefs';

import VolumeAttachmentHandler from '@src/kindhandlers/VolumeAttachment.handler';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import ClusterRoleHandler from './ClusterRole.handler';
import ClusterRoleBindingHandler from './ClusterRoleBinding.handler';
import ConfigMapHandler from './ConfigMap.handler';
import CronJobHandler from './CronJob.handler';
import CustomResourceDefinitionHandler from './CustomResourceDefinition.handler';
import DaemonSetHandler from './DaemonSet.handler';
import DeploymentHandler from './Deployment.handler';
import EndpointsHandler from './Endpoints.handler';
import IngressHandler from './Ingress.handler';
import JobHandler from './Job.handler';
import NamespaceHandler from './Namespace.handler';
import NetworkPolicyHandler from './NetworkPolicy.handler';
import PersistentVolumeHandler from './PersistentVolume.handler';
import PersistentVolumeClaimHandler from './PersistentVolumeClaim.handler';
import PodHandler from './Pod.handler';
import ReplicaSetHandler from './ReplicaSet.handler';
import ReplicationControllerHandler from './ReplicationController.handler';
import RoleHandler from './Role.handler';
import RoleBindingHandler from './RoleBinding.handler';
import SecretHandler from './Secret.handler';
import ServiceHandler from './Service.handler';
import ServiceAccountHandler from './ServiceAccount.handler';
import StatefulSetHandler from './StatefulSet.handler';
import {getFormSchema, getUiSchema} from './common/formLoader';

/**
 * Initialize native ResourceKindHandlers
 */

export const ResourceKindHandlers: ResourceKindHandler[] = [
  ClusterRoleHandler,
  ClusterRoleBindingHandler,
  ConfigMapHandler,
  CronJobHandler,
  CustomResourceDefinitionHandler,
  DaemonSetHandler,
  DeploymentHandler,
  EndpointsHandler,
  IngressHandler,
  JobHandler,
  NetworkPolicyHandler,
  NamespaceHandler,
  PersistentVolumeClaimHandler,
  PersistentVolumeHandler,
  PodHandler,
  ReplicaSetHandler,
  ReplicationControllerHandler,
  RoleHandler,
  RoleBindingHandler,
  SecretHandler,
  ServiceHandler,
  ServiceAccountHandler,
  StatefulSetHandler,
  VolumeAttachmentHandler,
];

const HandlerByResourceKind = Object.fromEntries(
  ResourceKindHandlers.map(kindHandler => {
    if (kindHandler.isCustom) {
      return kindHandler;
    }
    return {
      ...kindHandler,
      formEditorOptions: {
        editorSchema: getFormSchema(kindHandler.kind),
        editorUiSchema: getUiSchema(kindHandler.kind),
      },
    };
  }).map(kindHandler => [kindHandler.kind, kindHandler])
);

export function registerKindHandler(kindHandler: ResourceKindHandler, shouldReplace: boolean) {
  if (shouldReplace || !HandlerByResourceKind[kindHandler.kind]) {
    log.info(`Adding KindHandler for ${kindHandler.clusterApiVersion}.${kindHandler.kind}`, kindHandler);
    HandlerByResourceKind[kindHandler.kind] = kindHandler;
    // we need to store the list of registered kind handlers in the redux store for reactivity
    KindHandlersEventEmitter.emit('register', kindHandler);

    const ix = ResourceKindHandlers.findIndex(handler => handler.kind === kindHandler.kind);
    if (ix >= 0) {
      ResourceKindHandlers.splice(ix, 1);
    }

    ResourceKindHandlers.push(kindHandler);
  }
}

/**
 * THIS IS NOT REACTIVE, use the knownResourceKindsSelector if you need reactivy
 * @returns list of registered resource kinds
 */
export const getKnownResourceKinds = () => {
  return ResourceKindHandlers.map(handler => handler.kind);
};

/**
 * THIS IS NOT REACTIVE, use the registeredKindHandlersSelector if you need reactivity
 * @returns list of registered ResourceKindHandlers
 */
export const getRegisteredKindHandlers = () => {
  return ResourceKindHandlers;
};

export const getResourceKindHandler = (resourceKind: string): ResourceKindHandler | undefined => {
  return HandlerByResourceKind[resourceKind];
};

const incomingRefMappersCache = new Map<string, RefMapper[]>();

/**
 * Gets all incoming refMappers for the specified resource kind
 */

export const getIncomingRefMappers = (resourceKind: string): RefMapper[] => {
  if (!incomingRefMappersCache.has(resourceKind)) {
    incomingRefMappersCache.set(
      resourceKind,
      ResourceKindHandlers.map(
        resourceKindHandler =>
          resourceKindHandler.outgoingRefMappers?.filter(outgoingRefMapper =>
            refMapperMatchesKind(outgoingRefMapper, resourceKind)
          ) || []
      ).flat()
    );
  }
  return incomingRefMappersCache.get(resourceKind) || [];
};

/**
 * Finds all resource kinds that depend on the specified resource kind(s) via refMappers
 */

export const getDependentResourceKinds = (resourceKinds: string[]) => {
  const dependentResourceKinds: string[] = [];
  ResourceKindHandlers.forEach(kindHandler => {
    if (!kindHandler.outgoingRefMappers || kindHandler.outgoingRefMappers.length === 0) {
      return;
    }
    kindHandler.outgoingRefMappers.forEach(outgoingRefMapper => {
      if (resourceKinds.some(kind => refMapperMatchesKind(outgoingRefMapper, kind))) {
        dependentResourceKinds.push(kindHandler.kind);
      }
    });
  });
  return [...new Set(dependentResourceKinds)];
};

/**
 * Read bundled kindhandlers and emit event to notify when finished (used in tests)
 */

export const KindHandlersEventEmitter = new EventEmitter();
readBundledCrdKindHandlers();

async function readBundledCrdKindHandlers() {
  // eslint-disable-next-line no-restricted-syntax
  for await (const crdPath of findFiles(getStaticResourcePath(`kindhandlers${path.sep}crds`), '.yaml')) {
    try {
      const crdContent = fs.readFileSync(crdPath, 'utf-8');
      if (crdContent) {
        const documents = parseAllDocuments(crdContent, {prettyErrors: true});
        documents.forEach(doc => {
          const crd = doc.toJS({maxAliasCount: -1});
          if (crd && crd.kind && crd.kind === 'CustomResourceDefinition') {
            const kindHandler = extractKindHandler(crd, `kindhandlers${path.sep}handlers`);
            if (kindHandler) {
              registerKindHandler(kindHandler, false);
            }
          }
        });
      }
    } catch (e) {
      log.warn(`Failed to parse kindhandler CRD at ${crdPath}`, e);
    }
  }

  KindHandlersEventEmitter.emit('loadedKindHandlers');
}

export const awaitKindHandlersLoading = new Promise<void>(resolve => {
  KindHandlersEventEmitter.once('loadedKindHandlers', () => {
    resolve();
  });
});

/**
 * inspired by https://stackoverflow.com/a/45130990/249414
 */

async function* findFiles(dir: string, ext: string): any {
  const dirents = await readdir(dir, {withFileTypes: true});

  for (let i = 0; i < dirents.length; i += 1) {
    const dirent = dirents[i];
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* findFiles(res, ext);
    } else if (res.endsWith(ext)) {
      yield res;
    }
  }
}

/**
 * Matches the specified resource against the kind and apiVersionMatcher of the specified ResourceKindHandler
 */

export function resourceMatchesKindHandler(resource: K8sResource, kindHandler: ResourceKindHandler) {
  return resource.kind === kindHandler.kind && micromatch.isMatch(resource.version, kindHandler.apiVersionMatcher);
}
