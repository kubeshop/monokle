import fs from 'fs';
import log from 'loglevel';
import {parseAllDocuments} from 'yaml';

import {RefMapper, ResourceKindHandler} from '@models/resourcekindhandler';

import {getStaticResourcePath} from '@redux/services';
import {extractSchema} from '@redux/services/schema';
import {findDefaultVersion} from '@redux/thunks/previewCluster';

import VolumeAttachmentHandler from '@src/kindhandlers/VolumeAttachment.handler';
import {
  createClusterCustomObjectKindHandler,
  createNamespacedCustomObjectKindHandler,
} from '@src/kindhandlers/common/customObjectKindHandler';
import DestinationRuleHandler from '@src/kindhandlers/istio/DestinationRule.handler';
import EnvoyFilterHandler from '@src/kindhandlers/istio/EnvoyFilter.handler';
import GatewayHandler from '@src/kindhandlers/istio/Gateway.handler';
import ServiceEntryHandler from '@src/kindhandlers/istio/ServiceEntry.handler';
import SidecarHandler from '@src/kindhandlers/istio/Sidecar.handler';
import VirtualServiceHandler from '@src/kindhandlers/istio/VirtualService.handler';
import WorkloadEntryHandler from '@src/kindhandlers/istio/WorkloadEntry.handler';
import WorkloadGroupHandler from '@src/kindhandlers/istio/WorkloadGroup.handler';

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
  // Istio resources
  VirtualServiceHandler,
  DestinationRuleHandler,
  GatewayHandler,
  SidecarHandler,
  EnvoyFilterHandler,
  ServiceEntryHandler,
  WorkloadGroupHandler,
  WorkloadEntryHandler,
  // CertManager
  /*
  CertificateRequestHandler,
  IssuerHandler,
  CertificateHandler,
  ClusterIssuerHandler,
  AcmeOrderHandler,
  AcmeChallengeHandler,
*/
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

export function addKindHandler(kindHandler: ResourceKindHandler, overwrite: boolean) {
  if (overwrite || !HandlerByResourceKind[kindHandler.kind]) {
    log.info(`Adding KindHandler for ${kindHandler.kind}`);
    HandlerByResourceKind[kindHandler.kind] = kindHandler;
    ResourceKindHandlers.push(kindHandler);
  }
}

readCrdKindHandlers();

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
          resourceKindHandler.outgoingRefMappers?.filter(
            outgoingRefMapper => outgoingRefMapper.target.kind === resourceKind
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

export function extractKindHandler(crd: any, handlers?: string[]) {
  const spec = crd.spec;
  const kind = spec.names.kind;
  let subsectionName = spec.group;
  const kindSectionName = spec.names.plural;
  const kindGroup = spec.group;
  const kindVersion = findDefaultVersion(crd);

  if (kindVersion) {
    const kindPlural = spec.names.plural;
    const editorSchema = kindVersion ? extractSchema(crd, kindVersion) : undefined;
    let kindHandler: ResourceKindHandler | undefined;
    let helpLink: string | undefined;
    let refMappers: any[] | undefined;

    const handlerPath = handlers ? handlers.find(file => file.endsWith(`${kindGroup}.${kind}.json`)) : undefined;
    if (handlerPath) {
      log.info(`found handler ${handlerPath}`);
      try {
        const handlerContent = fs.readFileSync(handlerPath, 'utf-8');
        if (handlerContent) {
          const handler = JSON.parse(handlerContent);
          if (handler) {
            helpLink = handler.helpLink;
            subsectionName = handler.sectionName;
            refMappers = handler.refMappers;
          }
        }
      } catch (e) {
        log.warn(`Failed to parse kindhandler ${handlerPath}`, e);
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

    if (kindHandler) {
      addKindHandler(kindHandler, true);
    }
  }
}

export function readCrdKindHandlers() {
  const handlers = findFiles(getStaticResourcePath('kindhandlers/handlers'), '.json');
  log.info('found handlers', handlers);
  const crds = findFiles(getStaticResourcePath('kindhandlers/crds'), '.yaml');
  crds.forEach(crdPath => {
    try {
      const crdContent = fs.readFileSync(crdPath, 'utf-8');
      if (crdContent) {
        const documents = parseAllDocuments(crdContent, {prettyErrors: true, strict: false});
        documents.forEach(doc => {
          const crd = doc.toJS({maxAliasCount: -1});
          if (crd && crd.kind && crd.kind === 'CustomResourceDefinition') {
            extractKindHandler(crd, handlers);
          }
        });
      }
    } catch (e) {
      log.warn(`Failed to parse kindhandler CRD at ${crdPath}`, e);
    }
  });
}

export function refMapperMatchesKind(refMapper: RefMapper, kind: string) {
  if (refMapper.target.kind.startsWith('$')) {
    return kind.match(refMapper.target.kind.substring(1)) !== null;
  }

  return refMapper.target.kind === kind;
}
