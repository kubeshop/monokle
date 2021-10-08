# Getting Started with Monokle

Monokle is a standalone desktop application, you can either download a signed installer for the latest release
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



