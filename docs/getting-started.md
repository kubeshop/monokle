# Getting Started with Monokle

Monokle is a standalone desktop application, you can either download an installer 
from [releases](https://github.com/kubeshop/monokle/releases) or clone our repo and run as described below!

## Running from source

### Mac

Clone this repo and build with

```
nvm install
npm install --force
```

run with

```
npm run electron:dev
```

### Windows

Clone this repo, make sure you are running the node version specified in `.npmrc`, then run:

```
npm install --force
```

run with

```
npm run electron:dev
```

The Electron app will reload if you make edits in the `electron` directory.<br> You will also see any lint errors in the
console.

## Auto-update Installers

Installers are notarized for both macOS and Windows, which allows you to auto-update functionalities. Monokle checks for new versions on startup and notifies the user. You can also install it manually via the new system menu. 

**Action:** Electron > Check for Update

![Auto Update](img/auto-update.png)

Please report any issues you have!
