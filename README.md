React-TypeScript-Electron sample with Create React App and Electron Builder
===========================================================================

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) with `--template typescript`option.

On the top of it, the following features have been added with realatively small changes:

* TypeScript supports for Electron main process source code
* Hot-relaod support for Electron app
* Electron Bulder support

## Available Scripts in addition to the existing ones

### `npm run electron:dev`

Runs the Electron app in the development mode.

The Electron app will reload if you make edits in the `electron` directory.<br>
You will also see any lint errors in the console.

### `npm run electron:build`

Builds the Electron app package for production to the `dist` folder.

Your Electron app is ready to be distributed!

## Project directory structure

```bash
my-app/
├── package.json
│
## render process
├── tsconfig.json
├── public/
├── src/
│
## main process
├── electron/
│   ├── main.ts
│   └── tsconfig.json
│
## build output
├── build/
│   ├── index.html
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   │
│   └── electron/
│      └── main.js
│
## distribution packges
└── dist/
    ├── mac/
    │   └── my-app.app
    └── my-app-0.1.0.dmg
```

## Do it yourself from scratch

### Generate a React project and install npm dependencies

```bash
create-react-app my-app --template typescript
cd my-app
yarn add @types/electron-devtools-installer electron-devtools-installer electron-is-dev electron-reload
yarn add -D concurrently electron electron-builder wait-on cross-env
```

### Make Electron main process source file

#### electron/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "sourceMap": true,
    "strict": true,
    "outDir": "../build", // Output transpiled files to build/electron/
    "rootDir": "../",
    "noEmitOnError": true,
    "typeRoots": [
      "node_modules/@types"
    ]
  }
}
```

#### electron/main.ts

```ts
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:3000/index.html');
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  win.on('closed', () => win = null);

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      forceHardReset: true,
      hardResetMethod: 'exit'
    });
  }

  // DevTools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
```

### Adjust package.json

#### Add properties for Electron

```json
  "homepage": ".", # see https://create-react-app.dev/docs/deployment#serving-the-same-build-from-different-paths
  "main": "build/electron/main.js",
```

#### Add properties for Electron Builder

```json
  "author": "Your Name",
  "description": "React-TypeScript-Electron sample with Create React App and Electron Builder",
  ...
  "build": {
    "extends": null, # see https://github.com/electron-userland/electron-builder/issues/2030#issuecomment-386720420
    "files": [
      "build/**/*"
    ],
    "directories": {
      "buildResources": "assets" # change the resource directory from 'build' to 'assets'
    }
  },
```

#### Add scripts

```json
  "scripts": {
    "postinstall": "electron-builder install-app-deps",
    "electron:dev": "concurrently \"cross-env BROWSER=none yarn start\" \"wait-on http://localhost:3000 && tsc -p electron -w\" \"wait-on http://localhost:3000 && tsc -p electron && electron .\"",
    "electron:build": "yarn build && tsc -p electron && electron-builder",
```

## Many thanks to the following articles!

- [⚡️ From React to an Electron app ready for production](https://medium.com/@kitze/%EF%B8%8F-from-react-to-an-electron-app-ready-for-production-a0468ecb1da3)
- [How to build an Electron app using Create React App and Electron Builder](https://www.codementor.io/randyfindley/how-to-build-an-electron-app-using-create-react-app-and-electron-builder-ss1k0sfer)
- [Application entry file reset to default (react-cra detected and config changed incorrectly)](https://github.com/electron-userland/electron-builder/issues/2030)
- [Serving the Same Build from Different Paths](https://create-react-app.dev/docs/deployment#serving-the-same-build-from-different-paths)

## 
