import {ResourceKindHandler, RefMapper} from '@models/resourcekindhandler';

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
import NetworkPolicyHandler from './NetworkPolicy.handler';
import NamespaceHandler from './Namespace.handler';
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
];

const HandlerByResourceKind = Object.fromEntries(
  ResourceKindHandlers.map(kindHandler => [kindHandler.kind, kindHandler])
);

export const getResourceKindHandler = (resourceKind: string): ResourceKindHandler | undefined => {
  return HandlerByResourceKind[resourceKind];
};

export const getIncomingRefMappers = (resourceKind: string): RefMapper[] => {
  return ResourceKindHandlers.map(
    resourceKindHandler =>
      resourceKindHandler.outgoingRefMappers?.filter(
        outgoingRefMapper => outgoingRefMapper.target.kind === resourceKind
      ) || []
  ).flat();
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
