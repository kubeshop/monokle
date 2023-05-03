export interface WorkerMessage {
  type: string;
  input: any;
  output: any;
}

export const matchWorkerEvent = (event: MessageEvent, type: string) => event.data.type === type;

// TODO: add a promise timeout
export const createWorkerEventPromise = <Output extends any>(args: {worker: Worker; type: string; input: any}) => {
  const {worker, type, input} = args;
  worker.postMessage({type, input});
  return new Promise<Output>(resolve => {
    worker.onmessage = event => {
      if (!matchWorkerEvent(event, type)) {
        return;
      }
      resolve(event.data.output);
    };
  });
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
