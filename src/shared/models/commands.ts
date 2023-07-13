export type CommandOptions = {
  commandId: string;
  cmd: string;
  args: string[];
  env?: any;
  input?: string;
  cwd?: string;
};

export type CommandResult = {
  commandId: string;
  exitCode: null | number;
  signal: null | string;
  stderr?: string;
  stdout?: string;
  error?: string;
};

export type HelmEnv = {
  KUBECONFIG?: string;
};

export type HelmInstallArgs = {
  values: string;
  name: string;
  chart: string;
};

export type HelmTemplateArgs = {
  values: string;
  name: string;
  chart: string;
};

export type KubectlEnv = {
  KUBECONFIG?: string;
};

export type KubectlApplyArgs = {
  context: string;
  input: string;
  namespace?: string;
};
