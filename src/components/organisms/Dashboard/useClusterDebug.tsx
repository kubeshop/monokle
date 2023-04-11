import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {debugProxy} from '@redux/cluster/service/kube-control';

import {ContextId, DebugProxyResponse, MonokleClusterError} from '@shared/ipc';

type Status = 'idle' | 'error' | 'loading' | 'success';

type DebugResponse = {
  status: Status;
  error?: MonokleClusterError;
  data?: DebugProxyResponse;
  fetch: () => void;
};

export function useClusterDebug(contextId?: ContextId): DebugResponse {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<MonokleClusterError | undefined>(undefined);
  const [data, setData] = useState<DebugProxyResponse | undefined>(undefined);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const fetch = useCallback(async () => {
    try {
      if (statusRef.current === 'loading') {
        return;
      }

      if (!contextId) {
        setStatus('error');
        setError({
          code: 'context-missing',
          title: 'Cannot connect to the cluster',
          description: 'This context is missing. Please check your kubeconfig and try again.',
        });
        return;
      }

      setStatus('loading');
      const debugData = await debugProxy(contextId);
      setData(debugData);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError({
        code: 'unknown',
        title: 'Cannot connect to the cluster',
        description: 'Cannot connect to the cluster',
        learnMoreUrl: 'https://kubeshop.github.io/monokle/cluster-issues/',
        ...contextId,
      });
    }
  }, [contextId]);

  const result = useMemo(
    () => ({
      status,
      error,
      data,
      fetch,
    }),
    [status, error, data, fetch]
  );

  return result;
}
