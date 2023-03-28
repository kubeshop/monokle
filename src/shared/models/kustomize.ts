import {ResourceIdentifier} from './k8sResource';

type KustomizeCommandType = 'kubectl' | 'kustomize';

type KustomizationMenuItem = {
  id: string;
  name: string;
};

type KustomizeResourceNode = {
  type: 'kustomize-resource';
  identifier: ResourceIdentifier;
};

type KustomizeNode = {
  type: 'kustomize';
  identifier: ResourceIdentifier;
};

type KustomizeKindNode = {
  type: 'kustomize-kind';
  name: string;
  count: number;
};

export type {KustomizationMenuItem, KustomizeCommandType, KustomizeKindNode, KustomizeNode, KustomizeResourceNode};
