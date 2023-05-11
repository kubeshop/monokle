/* * * * * * * * * * * * * * *
 * Cluster errors
 * * * * * * * * * * * * * * */
export type MonokleClusterError = {
  code: string;
  title: string;
  description: string;
  learnMoreUrl?: string;
  context?: string;
  kubeconfig?: string;
};

/* * * * * * * * * * * * * * *
 * Setup
 * * * * * * * * * * * * * * */
export type SetupParams = {
  context: string;
  kubeconfig?: string;
  skipHealthCheck?: boolean;
};

export type SetupResult = SetupSuccess | SetupFailure;

export type SetupSuccess = {
  success: true;
  port: number;
};

export type SetupFailure = {
  success: false;
} & MonokleClusterError;

/* * * * * * * * * * * * * * *
 * Proxy logs
 * * * * * * * * * * * * * * */
export type DebugProxyArgs = {
  context: string;
  kubeconfig?: string;
};

export type DebugProxyResponse = {
  cmd: string;
  logs: ProxyLog[];
};

export type ProxyLog =
  | {
      type: 'stdout';
      timestamp: number;
      content: string;
    }
  | {
      type: 'stderr';
      timestamp: number;
      content: string;
    }
  | {
      type: 'exit';
      timestamp: number;
      content: string;
      code: number | null;
      signal: string | undefined;
    };
