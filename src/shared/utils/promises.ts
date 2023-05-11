export function promiseTimeout<T = any>(promise: Promise<T>, timeoutMs: number) {
  let timeout: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => {
      const error: Error = {name: 'TimeoutError', message: `Timed out in ${timeoutMs} ms.`};
      reject(error);
    }, timeoutMs);
  });

  const onPromiseFulfilled = (result: T) => {
    clearTimeout(timeout);
    return result;
  };

  const onPromiseRejected = (error: any) => {
    clearTimeout(timeout);
    throw error;
  };

  return Promise.race<T>([promise, timeoutPromise]).then(onPromiseFulfilled, onPromiseRejected);
}

export function isPromiseFulfilledResult<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return Boolean(result.status === 'fulfilled' && result.value);
}
