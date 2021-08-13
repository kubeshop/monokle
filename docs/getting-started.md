# Getting Started with Monokle

Either download an (as of yet unsigned) installer from [releases](https://github.com/kubeshop/monokle/releases) or
clone/build as described below!

- Read the [introductory blog-post](https://medium.com/kubeshop-i/hello-monokle-83ecb42f5d96) to get a quick intro and overview
- Ask questions, report bugs, suggest features, join our discussions
  [here on GitHub](https://github.com/kubeshop/monokle/discussions)
- See "Getting Involved" below on how to get involved!

Note: If you download the unsigned binary, MacOs might complain - here's how to fix it.  

- You need to go to Preferences > Security & Privacy > General.
- Text will appear saying: `Monokle was blocked from use because it is not from an identified developer.`
- Click the `Open Anyway` button. A new pop-up will say:
`macOs cannot verify the developer of Monokle.Are you sure you want to open it?`,
- Simply click `Move to Bin`. No wait, did you? You should have clicked `Open`, silly.

Alternatively - check out this document from [Apple Support](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac)

## Building / running

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
