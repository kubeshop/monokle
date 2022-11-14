import {ipcMain, ipcRenderer} from 'electron';

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

export function promiseFromIpcMain<Payload = any>(
  sender: string,
  receiver: string,
  senderPayload?: any
): Promise<Payload> {
  return new Promise(resolve => {
    ipcMain.once(receiver, (event, receiverPayload) => {
      resolve(receiverPayload);
    });
    ipcMain.emit(sender, senderPayload);
  });
}

export function promiseFromIpcRenderer<Payload = any>(
  sender: string,
  receiver: string,
  senderPayload?: any
): Promise<Payload> {
  return new Promise(resolve => {
    ipcRenderer.once(receiver, (event, receiverPayload) => {
      resolve(receiverPayload);
    });
    ipcRenderer.send(sender, senderPayload);
  });
}
