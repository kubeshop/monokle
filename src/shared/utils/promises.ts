export function promiseTimeout<T = any>(promise: Promise<T>, timeoutMs: number, onTimeout?: () => void) {
  let timeout: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`Timed out in ${timeoutMs} ms.`, {cause: 'timeout'}));
    }, timeoutMs);
  });

  const onPromiseFulfilled = (result: T) => {
    clearTimeout(timeout);
    return result;
  };

  const onPromiseRejected = (error: any) => {
    if (error instanceof Error && error.cause === 'timeout' && onTimeout) {
      onTimeout();
    }
    clearTimeout(timeout);
    throw error;
  };

  return Promise.race<T>([promise, timeoutPromise]).then(onPromiseFulfilled, onPromiseRejected);
}

export function isPromiseFulfilledResult<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return Boolean(result.status === 'fulfilled' && result.value);
}
