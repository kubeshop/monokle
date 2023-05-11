import log from 'loglevel';

import {promiseTimeout} from '@shared/utils/promises';

const WORKER_TIMEOUT_MS = 60000;

export interface WorkerMessage {
  type: string;
  input: any;
  output: any;
}

export const matchWorkerEvent = (event: MessageEvent, type: string) => event.data.type === type;

export const createWorkerEventPromise = async <Output extends any>(args: {
  worker: Worker;
  type: string;
  input: any;
}) => {
  const {worker, type, input} = args;
  worker.postMessage({type, input});

  const abortController = new AbortController();

  try {
    const workerEventPromise = promiseTimeout(
      new Promise<Output>(resolve => {
        const onMessage = (event: MessageEvent) => {
          if (!matchWorkerEvent(event, type)) {
            return;
          }
          log.info('[WORKER_EVENT_FULFILLED]', event);
          worker.removeEventListener('message', onMessage);
          resolve(event.data.output);
        };
        worker.addEventListener('message', onMessage, {signal: abortController.signal});
      }),
      WORKER_TIMEOUT_MS
    );

    const output = await workerEventPromise;
    return output;
  } catch (e: any) {
    if ('name' in e && e.name === 'TimeoutError') {
      abortController.abort();
    }
    throw e;
  }
};

export const handleEvent = <Message extends WorkerMessage>(
  event: MessageEvent,
  type: Message['type'],
  handler: (input: Message['input']) => Promise<Message['output']>
): void => {
  if (!matchWorkerEvent(event, type)) {
    return;
  }
  const {input} = event.data as Message;
  handler(input).then(output => {
    postMessage({type, output});
  });
};
