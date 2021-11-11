## Building / running

Clone this repo and make sure you are running the node version specified in `.npmrc`

### Mac

```
nvm install # assert nodejs version
npm install
```

run with

```
npm run electron:dev
```

### Windows

```
npm install --force
```

run with

```
npm run electron:dev
```

The Electron app will reload if you make edits in the `electron` directory.<br> You will also see any lint errors in the
console.

Use

```
npm run electron:build
```

to build the Electron app package for production to the `dist` folder.
