type KustomizeCommandType = 'kubectl' | 'kustomize';

interface KustomizationMenuItem {
  id: string;
  name: string;
}

export type {KustomizationMenuItem, KustomizeCommandType};
