import {BrowserWindow} from 'electron';

import getPort from 'get-port';
import * as http from 'http';

const isDev = process.env.NODE_ENV === 'development';
const localContent: Record<string, string> = {};
let server: http.Server | undefined;

export const createWorker = () => {
  let workerWindow = new BrowserWindow({show: false});

  if (isDev) {
    workerWindow.loadURL('http://localhost:3000/worker.html');
    workerWindow.webContents.openDevTools();
  } else {
    workerWindow.loadURL(`file://${__dirname}/../../worker.html`);
  }

  workerWindow.webContents.once('did-finish-load', () => {
    console.log('Worker initialized..');
  });
};

function initServer() {
  console.log('Initializing local server');
  server = http.createServer((req, res) => {
    if (req.url && localContent[req.url]) {
      console.log(`Serving content for ${req.url}`);
      res.write(localContent[req.url]);
      res.end();
    } else {
      res.end(`Not found - stranger things have happened.`);
    }
  });

  if (server) {
    getPort({port: 51038}).then(port => {
      if (server) {
        server.listen(port);
        console.log(`Local server listening on port ${port}`);
      }
    });
  }
}

export const addLocalServerContent = (path: string, content: string) => {
  if (!server) {
    initServer();
  }

  localContent[path] = content;
};
