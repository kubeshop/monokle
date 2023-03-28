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

type KustomizeListNode = KustomizeKindNode | KustomizeNode | KustomizeResourceNode;

export type {
  KustomizationMenuItem,
  KustomizeCommandType,
  KustomizeListNode,
  KustomizeKindNode,
  KustomizeNode,
  KustomizeResourceNode,
};
