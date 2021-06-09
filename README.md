## ManifestUI

Desktop UI for managing k8s manifests.

## Components used

* https://github.com/eemeli/yaml for yaml parsing
* https://github.com/react-monaco-editor/react-monaco-editor for source editing
* https://github.com/shunjizhan/react-folder-tree for file/folder tree
* https://github.com/micromatch/micromatch for dynamic filtering in navigator and file exclusion matching
* https://github.com/JSONPath-Plus/JSONPath for finding refs/selectors in resources

## Building

This project was bootstrapped from https://github.com/yhirose/react-typescript-electron-sample-with-create-react-app-and-electron-builder, which
provides

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
