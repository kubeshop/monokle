type KustomizeCommandType = 'kubectl' | 'kustomize';

type KustomizationMenuItem = {
  id: string;
  name: string;
};

type KustomizeNode = {
  type: 'kustomize';
  id: string;
};

type KustomizeHeaderNode = {
  type: 'kustomize-header';
  label: string;
  count: number;
};

export type {KustomizationMenuItem, KustomizeCommandType, KustomizeHeaderNode, KustomizeNode};
