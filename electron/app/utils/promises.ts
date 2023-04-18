export function promiseTimeout<T = any>(promise: Promise<T>, timeoutMs: number) {
  let timeout: NodeJS.Timeout;
  // @ts-ignore
  return Promise.race<Promise<T>>([
    promise,
    new Promise((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`Timed out in ${timeoutMs} ms.`));
      }, timeoutMs);
    }),
  ]).then(
    result => {
      clearTimeout(timeout);
      return result;
    },
    error => {
      clearTimeout(timeout);
      throw error;
    }
  );
}
