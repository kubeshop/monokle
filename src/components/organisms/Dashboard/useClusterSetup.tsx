import {useEffect, useMemo, useState} from 'react';

import {setup} from '@redux/cluster/service/kube-control';

import {ContextId, MonokleClusterError} from '@shared/ipc';

type Status = 'idle' | 'error' | 'loading' | 'success';

type SetupResponse = {
  status: Status;
  error?: MonokleClusterError;
};

export function useClusterSetup(contextId?: ContextId): SetupResponse {
  const [previousContext, setPreviousContext] = useState<ContextId | undefined>(contextId);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<MonokleClusterError | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const changedContext = previousContext !== contextId;
        if (!changedContext && status !== 'idle') {
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
        setPreviousContext(contextId);
        const response = await setup(contextId);

        if (response.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setError(response);
        }
      } catch (err) {
        setStatus('error');
        setError({
          code: 'unknown',
          title: 'Cannot connect to the cluster',
          description: 'Cannot connect to the cluster',
          learnMoreUrl: 'https://kubeshop.github.io/monokle/cluster-issues/',
        });
      }
    })();
  }, [setStatus, status, error, contextId, previousContext]);

  const result = useMemo(
    () => ({
      status,
      error,
    }),
    [status, error]
  );

  return result;
}
