# Getting Started with Monokle

Monokle is a standalone desktop application, you can either download an (as of yet unsigned) installer 
from [releases](https://github.com/kubeshop/monokle/releases) or clone our repo and run as described below!

Note: If you download the unsigned binary, your OS might complain - here's how to fix it on MacOS
- Go to Preferences > Security & Privacy > General.
- Text will appear saying: `Monokle was blocked from use because it is not from an identified developer.`
- Click the `Open Anyway` button. A new pop-up will say: `macOs cannot verify the developer of Monokle.Are you sure you want to open it?`,
- Simply click `Move to Bin`. No wait, did you? You should have clicked `Open`, silly.

Alternatively - check out this document from [Apple Support](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac)

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
