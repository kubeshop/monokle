/* eslint-disable @typescript-eslint/no-shadow */
function generateUniqueId(): string {
  return `${Date.now().toString(32)}${Math.random().toString(32).replace(/\./g, '')}`;
}

type WorkerType = Worker & {
  [key: string]: (...args: any[]) => any;
};

type CallbacksMapType = Record<
  string,
  {
    resolve: (value: any | PromiseLike<any>) => void;
    reject: (reason?: any) => void;
  }
>;

type MessageData = {
  type: 'RPC';
  id: string;
};

type ResultMessageData = MessageData & {
  result: any;
};

type ErrorMessageData = MessageData & {
  error: string;
};

export function workerify(
  code: string,
  {
    name,
    type,
    methods = {},
    proxy = {},
  }: WorkerOptions & {
    methods?: Record<string, null | string>;
    proxy?: Record<string, boolean>;
  }
): WorkerType | null {
  if (typeof Worker !== 'function') {
    return null;
  }

  const namespace = `__methods__`;
  const requestCallbacksMap: CallbacksMapType = {};

  code = `${code};\nconst ${namespace} = {};\n`;

  // eslint-disable-next-line no-restricted-syntax
  for (const methodName of Object.keys(methods)) {
    code += `\n${namespace}.${methodName} = ${methods[methodName] || methodName}`;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const fnName of Object.keys(proxy)) {
    if (proxy[fnName]) {
      code += `\n${namespace}.${fnName} = ${fnName}`;
    }
  }

  code += `
\nself.addEventListener('message', ({ data }) => {
  if(data.type !== 'RPC' || data.id == null) return;

  Promise.resolve(${namespace}[data.name].apply(data.ctx, data.params))
    .then(result => self.postMessage({ type: 'RPC', id: data.id, result }))
    .catch(error => self.postMessage({ type: 'RPC', id: data.id, error: String(error) }))
})`;

  const url = URL.createObjectURL(new Blob([code], {type: 'text/javascript'}));
  const worker = new Worker(url, {name, type}) as WorkerType;

  const callMethod = (name: string, ...params: any[]) =>
    new Promise((resolve, reject) => {
      const id = generateUniqueId();
      requestCallbacksMap[id] = {resolve, reject};
      worker.postMessage({type: 'RPC', id, name, params});
    });

  // eslint-disable-next-line no-restricted-syntax
  for (const name of [...Object.keys(methods), ...Object.keys(proxy)]) {
    if (name in worker) {
      // eslint-disable-next-line no-console
      console.warn(`[workerify]: method "${name}" already exists on worker`);
    } else {
      Object.defineProperty(worker, name, {
        value: (...params: any[]) => callMethod(name, ...params),
        enumerable: true,
      });
    }
  }

  worker.addEventListener('message', ({data}: MessageEvent<ResultMessageData | ErrorMessageData>) => {
    const {resolve, reject} = requestCallbacksMap[data.id] ?? {};
    delete requestCallbacksMap[data.id];
    if ((data as ErrorMessageData).error && typeof reject === 'function')
      reject(new Error((data as ErrorMessageData).error));
    else typeof resolve === 'function' && resolve((data as ResultMessageData).result);
  });

  return worker;
}
