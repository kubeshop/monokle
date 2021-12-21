import {RefMapper, ResourceKindHandler} from '@models/resourcekindhandler';

import VolumeAttachmentHandler from '@src/kindhandlers/VolumeAttachment.handler';
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
];

const HandlerByResourceKind = Object.fromEntries(
  ResourceKindHandlers.map(kindHandler => ({
    ...kindHandler,
    formEditorOptions: {
      editorSchema: getFormSchema(kindHandler.kind),
      editorUiSchema: getUiSchema(kindHandler.kind),
    },
  })).map(kindHandler => [kindHandler.kind, kindHandler])
);

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
      if (resourceKinds.includes(outgoingRefMapper.target.kind)) {
        dependentResourceKinds.push(kindHandler.kind);
      }
    });
  });
  return [...new Set(dependentResourceKinds)];
};
