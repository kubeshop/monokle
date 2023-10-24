import EventEmitter from 'events';
import fs from 'fs';
import {readdir} from 'fs/promises';
import log from 'loglevel';
import micromatch from 'micromatch';
import path from 'path';

import {parseAllYamlDocuments} from '@utils/yaml';

import EndpointSliceHandler from '@src/kindhandlers/EndpointSlice.handler';
import HorizontalPodAutoscalerHandler from '@src/kindhandlers/HorizontalPodAutoscaler.handler';
import LimitRangeHandler from '@src/kindhandlers/LimitRange.handler';
import ResourceQuotaHandler from '@src/kindhandlers/ResourceQuota.handler';
import StorageClassHandler from '@src/kindhandlers/StorageClass.handler';
import ValidatingAdmissionPolicyHandler from '@src/kindhandlers/ValidatingAdmissionPolicy.handler';
import ValidatingAdmissionPolicyBindingHandler from '@src/kindhandlers/ValidatingAdmissionPolicyBinding.handler';
import VolumeAttachmentHandler from '@src/kindhandlers/VolumeAttachment.handler';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {getSubfolders, readFiles} from '@shared/utils/fileSystem';
import {getStaticResourcePath} from '@shared/utils/resource';

import ClusterRoleHandler from './ClusterRole.handler';
import ClusterRoleBindingHandler from './ClusterRoleBinding.handler';
import ConfigMapHandler from './ConfigMap.handler';
import CronJobHandler from './CronJob.handler';
import CustomResourceDefinitionHandler from './CustomResourceDefinition.handler';
import DaemonSetHandler from './DaemonSet.handler';
import DeploymentHandler from './Deployment.handler';
import EndpointsHandler from './Endpoints.handler';
import EventHandler from './EventHandler';
import IngressHandler from './Ingress.handler';
import JobHandler from './Job.handler';
import NamespaceHandler from './Namespace.handler';
import NetworkPolicyHandler from './NetworkPolicy.handler';
import NodeHandler from './NodeHandler';
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
  EndpointSliceHandler,
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
  StorageClassHandler,
  ResourceQuotaHandler,
  LimitRangeHandler,
  HorizontalPodAutoscalerHandler,
  NodeHandler,
  EventHandler,
  ValidatingAdmissionPolicyHandler,
  ValidatingAdmissionPolicyBindingHandler,
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
    log.info(`Adding KindHandler for ${kindHandler.clusterApiVersion}.${kindHandler.kind}`);
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
 * **THIS IS NOT REACTIVE**, use the knownResourceKindsSelector if you need reactivity
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
        registerCrdKindHandlers(crdContent, `kindhandlers${path.sep}handlers`);
      }
    } catch (e) {
      log.warn(`Failed to parse kindhandler CRD at ${crdPath}`, e);
    }
  }

  KindHandlersEventEmitter.emit('loadedKindHandlers');
}

export async function readSavedCrdKindHandlers(crdsDir: string) {
  const subdirectories = await getSubfolders(crdsDir);
  for (let i = 0; i < subdirectories.length; i += 1) {
    const dirName = subdirectories[i];
    const dirPath = path.join(crdsDir, dirName);
    let fileContents: string[] = [];
    try {
      // eslint-disable-next-line no-await-in-loop
      fileContents = await readFiles(dirPath);
    } catch (e) {
      log.warn(`Couldn't read files from ${dirPath}`);
    }
    for (let j = 0; j < fileContents.length; j += 1) {
      const content = fileContents[j];
      registerCrdKindHandlers(content);
    }
  }
}

export function registerCrdKindHandlers(crdContent: string, handlerPath?: string, shouldReplace?: boolean) {
  const documents = parseAllYamlDocuments(crdContent);
  documents.forEach(doc => {
    const crd = doc.toJS({maxAliasCount: -1});
    if (crd && crd.kind && crd.kind === 'CustomResourceDefinition') {
      const kindHandler = extractKindHandler(crd, handlerPath);
      if (kindHandler) {
        registerKindHandler(kindHandler, Boolean(shouldReplace));
      }
    }
  });
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

export function resourceMatchesKindHandler(resource: ResourceMeta, kindHandler: ResourceKindHandler) {
  return resource.kind === kindHandler.kind && micromatch.isMatch(resource.apiVersion, kindHandler.apiVersionMatcher);
}
