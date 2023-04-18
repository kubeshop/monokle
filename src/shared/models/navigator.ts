import {ResourceIdentifier} from './k8sResource';

type KindNode = {
  type: 'kind';
  name: string;
  resourceCount: number;
};

type ResourceNode = {
  type: 'resource';
  identifier: ResourceIdentifier;
};

export type ResourceNavigatorNode = KindNode | ResourceNode;
