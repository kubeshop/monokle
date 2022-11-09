import {ipcMain, ipcRenderer} from 'electron';

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
