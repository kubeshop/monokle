export type KubeConfigContext = {
  cluster: string;
  name: string;
  user: string | null;
  namespace: string | null;
};

export type KubeConfig = {
  contexts: Array<KubeConfigContext>;
  currentContext: string | undefined;
};
