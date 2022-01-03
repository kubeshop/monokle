import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {parseAllDocuments} from 'yaml';

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

export function registerKindHandler(kindHandler: ResourceKindHandler, replace: boolean) {
  if (replace || !HandlerByResourceKind[kindHandler.kind]) {
    log.info(`Adding KindHandler for ${kindHandler.clusterApiVersion}.${kindHandler.kind}`);
    HandlerByResourceKind[kindHandler.kind] = kindHandler;

    const ix = ResourceKindHandlers.findIndex(handler => handler.kind === kindHandler.kind);
    if (ix >= 0) {
      ResourceKindHandlers.splice(ix, 1);
    }

    ResourceKindHandlers.push(kindHandler);
  }
}

readBundledCrdKindHandlers();

export const getKnownResourceKinds = () => {
  return ResourceKindHandlers.map(handler => handler.kind);
};

export const getResourceKindHandler = (resourceKind: string): ResourceKindHandler | undefined => {
  return HandlerByResourceKind[resourceKind];
};

const incomingRefMappersCache = new Map<string, RefMapper[]>();

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

function readBundledCrdKindHandlers() {
  const crds = findFiles(getStaticResourcePath(`kindhandlers${path.sep}crds`), '.yaml');
  crds.forEach(crdPath => {
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
  });
}

function findFiles(dir: string, ext: string) {
  let results: string[] = [];
  let list = fs.readdirSync(dir);
  list.forEach(file => {
    file = `${dir}/${file}`;
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file, ext));
    } else if (file.endsWith(ext)) {
      results.push(file);
    }
  });
  return results;
}
