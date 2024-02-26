import type {ContextId, MonokleClusterError} from '@shared/ipc';

const errors = createErrors({
  unknown: {
    title: 'Cannot connect to the cluster',
    description: 'An unknown problem occurred. Consider taking a peek at the debug logs.',
    learnMoreUrl: 'https://kubeshop.github.io/monokle/cluster-issues/',
  },
  'proxy-timeout': {
    title: 'Cannot connect to the cluster',
    description: 'The proxy could not be started.',
  },
  'proxy-empty-context': {
    title: 'Cannot connect to the cluster',
    description: 'There is no current context selected.',
  },
  'proxy-missing-context': {
    title: 'Cannot connect to the cluster',
    description: 'The specified context does not exist. Please check your kubeconfig file.',
  },
  'proxy-invalid-config': {
    title: 'Cannot connect to the cluster',
    description: 'The proxy connection arguments were invalid.',
  },
  'local-connection-refused': {
    title: 'Cannot connect to the cluster',
    description: 'The connection was refused - is your Docker Engine or VM running?',
  },
  'k8s-timeout': {
    title: 'Cannot connect to the cluster',
    description: 'The request timed out. Consider checking your firewall and server if the problem persists.',
  },
  'openssl-problem': {
    title: 'Cannot connect to the cluster',
    description:
      'A problem occurred in OpenSSL. Consider checking the certificate of your cluster if the problem persists.',
  },
  'k8s-unauthenticated': {
    title: 'Cannot connect to the cluster',
    description: 'The Kubernetes API server expects authentication or is misconfigured.',
  },
  'gcp-legacy-plugin': {
    title: 'Cannot authenticate to the cluster',
    description: 'The GCP auth plugin is deprecated and needs to be updated.',
    learnMoreUrl: 'https://cloud.google.com/blog/products/containers-kubernetes/kubectl-auth-changes-in-gke',
  },
  'gcp-gcloud-unauthenticated': {
    title: 'Cannot authenticate to the cluster',
    description:
      'A problem occurred in gcloud. Consider to re-authenticate, refetch cluster credentials and try again.',
  },
  'aws-sso-expired': {
    title: 'Cannot authenticate to the cluster',
    description:
      "Your AWS SSO sesion has expired or became invalid. Consider to re-authenticate with 'aws sso login' and try again.",
  },
});

export type MonokleClusterErrorCode = keyof typeof errors;

export function getMonokleClusterError(code: MonokleClusterErrorCode, contextId?: ContextId): MonokleClusterError {
  return {
    code,
    ...errors[code],
    ...contextId,
  };
}

function createErrors<TCode extends string>(
  init: Record<TCode, Omit<MonokleClusterError, 'code'>>
): Record<TCode, Omit<MonokleClusterError, 'code'>> {
  return init;
}
