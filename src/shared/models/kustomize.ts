type KustomizeCommandType = 'kubectl' | 'kustomize';

type KustomizationMenuItem = {
  id: string;
  name: string;
};

export type {KustomizationMenuItem, KustomizeCommandType};
