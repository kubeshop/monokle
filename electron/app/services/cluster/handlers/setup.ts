import log from 'electron-log';

import fetch from 'node-fetch';

import type {ContextId, MonokleClusterError, SetupParams, SetupResult} from '@shared/ipc';

import {getMonokleClusterError} from '../errors';
import {PROXY_SERVICE} from '../globals';

export async function setup({context, kubeconfig, skipHealthCheck}: SetupParams): Promise<SetupResult> {
  try {
    const proxy = await PROXY_SERVICE.get(context, kubeconfig);

    if (!skipHealthCheck) {
      await doHealthCheck(proxy.port);
    }

    return {success: true, port: proxy.port};
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Cannot access cluster';
    const clusterError = determineError(msg, {context, kubeconfig});
    return {
      success: false,
      ...clusterError,
    };
  }
}

async function doHealthCheck(port: number): Promise<boolean> {
  const response = await fetch(`http://127.0.0.1:${port}/api`);

  if (response.ok) return true;

  const reason = await response.text();
  throw new Error(reason);
}

function determineError(reason: string, contextId: ContextId): MonokleClusterError {
  // Monokle Proxy startup errors.
  // These happen locally while spawning the kube-proxy.
  // Most often inferred within our ProxyInstance.ts.
  if (reason === 'MONOKLE_PROXY_GCP_LEGACY_PLUGIN') {
    return getMonokleClusterError('gcp-legacy-plugin', contextId);
  }
  if (reason === 'MONOKLE_PROXY_TIMEOUT') {
    return getMonokleClusterError('proxy-timeout', contextId);
  }
  if (reason === 'MONOKLE_PROXY_EMPTY_CONTEXT') {
    return getMonokleClusterError('proxy-empty-context', contextId);
  }
  if (reason === 'MONOKLE_PROXY_MISSING_CONTEXT') {
    return getMonokleClusterError('proxy-missing-context', contextId);
  }
  if (reason === 'MONOKLE_PROXY_INVALID_CONFIG') {
    return getMonokleClusterError('proxy-invalid-config', contextId);
  }

  // Kubectl user authentication error.
  // These happen within the local kube-proxy.
  if (reason.includes('getting credentials: exec')) {
    if (reason.includes('gke-gcloud-auth-plugin')) {
      return getMonokleClusterError('gcp-gcloud-unauthenticated', contextId);
    }
    if (reason.includes('aws')) {
      return getMonokleClusterError('k8s-unauthenticated', contextId);
    }
  }
  if (reason.includes('Failed to retrieve access token') && reason.includes('gcloud')) {
    return getMonokleClusterError('gcp-gcloud-unauthenticated', contextId);
  }

  // Networking / OS errors between proxy and API server.
  // These can happen when a socket hangs up or a port refuses a connection.
  const isLocal = reason.includes('127.0.0.1') || reason.includes('0.0.0.0');
  const isRefused =
    reason.includes('connect: connection refused') ||
    reason.includes('ECONNREFUSED') ||
    reason.includes('No connection could be made because the target machine actively refused it');
  if (isLocal && isRefused) {
    return getMonokleClusterError('local-connection-refused', contextId);
  }
  if (reason.includes('ETIMEDOUT')) {
    return getMonokleClusterError('k8s-timeout', contextId);
  }
  if (reason.includes('OPENSSL')) {
    return getMonokleClusterError('openssl-problem', contextId);
  }

  if (reason.includes('"kind":"Status"') && reason.includes('401')) {
    // Kubernetes API server errors.
    // These happen within the remote server.
    return getMonokleClusterError('k8s-unauthenticated', contextId);
  }

  log.error('Cluster error reason:', reason);
  return getMonokleClusterError('unknown', contextId);
}
