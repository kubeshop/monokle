# Development

Monokle is an Electron desktop application built with React & TypeScript.  

This project was bootstrapped from
https://github.com/yhirose/react-typescript-electron-sample-with-create-react-app-and-electron-builder, 
which provides:
- TypeScript support for Electron main process source code.
- Hot-reload support for Electron app.
- Electron-builder support.

Check out the [Architecture](./architecture.md) document for more information.

## Building & running

### Prerequisites

- [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
- [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
- Clone this repository.
- Make sure you are running the node version specified in `.npmrc` or if you are using [nvm](https://github.com/nvm-sh/nvm), you can run the `nvm install` command to quickly install and use the required node version.

### Running

1. Install npm dependencies:
```
npm install
```

2. Start the application:

```
npm run electron:dev
```

## Hot reloading

The Electron app will reload if you make edits in the `electron` directory.  
You will also see any lint errors in the
console.


## Building
Build the Electron app package for production:

```
npm run electron:build
```

The output will be located in the `dist` folder.

## Help & Support

Feel free to reach out and ask questions on our [Discord server](https://discord.gg/uNuhy6GDyn).
