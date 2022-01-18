## Monokle Architecture

Monokle is an Electron desktop application built with React & TypeScript.  

Redux Toolkit is used for state management.   

Visuals are done using Ant Design.  

Other fairly common libraries/frameworks are used internally for common functionality (see components below).   

This project was bootstrapped from
https://github.com/yhirose/react-typescript-electron-sample-with-create-react-app-and-electron-builder, 
which provides:
- TypeScript support for Electron main process source code.
- Hot-relaod support for Electron app.
- Electron-builder support.

See https://www.electron.build/ for more info on Electron-builder.

## Folder structure

- /electron : Electron main thread - contains startup code and some ipc handlers invoked from the UI.
- /src : Root for monokle UI application - contains App.tsx, Index.tsx, etc.
    - /components : UI components - coarse to fine grained; organisms -> molecules -> atoms
    - /constants : constants..
    - /models : type definitions for core objects (see below) and states
    - /redux : redux-related code (selectors, hooks, store, reducers, thunks, services)
    - /styles : styles..
    - /utils : common utility functions
    - /assets : icons/images/etc
  
## Core objects

- Most logic revolves around [K8sResource](https://github.com/kubeshop/monokle/tree/main/src/models/k8sresource.ts) objects which "encapsulate" all 
data associated with a parsed resource.
- [FileEntry](https://github.com/kubeshop/monokle/tree/main/src/models/fileentry.ts) objects correspond to a parsed file - which can contain 0..n K8s Resource objects.
- The [AppState](https://github.com/kubeshop/monokle/tree/main/src/models/appstate.ts) holds the main state of the application (see inline comments), state
  changes are handled by the [main reducer](https://github.com/kubeshop/monokle/tree/main/src/redux/reducers/main.ts) 
  and corresponding [thunks](https://github.com/kubeshop/monokle/tree/main/src/redux/thunks)

## Main UI Components

The content of most high level [organisms](https://github.com/kubeshop/monokle/tree/main/src/components/organisms) and 
[molecules](https://github.com/kubeshop/monokle/tree/main/src/components/molecules) should be fairly self-explanatory. A few highlights:

- The [FileTreePane](https://github.com/kubeshop/monokle/tree/main/src/components/organisms/FileTreePane/FileTreePane.tsx) renders the selected folder.
- The [NavigatorPane](https://github.com/kubeshop/monokle/tree/main/src/components/organisms/NavigatorPane/NavigatorPane.tsx) renders the main resource 
  navigator, including sections for Helm Charts and Kustomizations.
- The [Monaco](https://github.com/kubeshop/monokle/tree/main/src/components/molecules/Monaco/Monaco.tsx) component renders the source editor using the
  Monaco editor (same as used by VS Code).
- The [FormEditor](https://github.com/kubeshop/monokle/tree/main/src/components/molecules/FormEditor/FormEditor.tsx) component renders nice forms for 
  K8sResources using the react-jsonschema-form component (see below), corresponding schemas/uiSchemas are 
  in the [resources/form-schemas](https://github.com/kubeshop/monokle/tree/main/resources/form-schemas) folder.

## 3rd party components used

* https://github.com/eemeli/yaml for yaml parsing.
* https://github.com/react-monaco-editor/react-monaco-editor for source editing.
* https://github.com/micromatch/micromatch for dynamic filtering in navigator and file exclusion matching.
* https://github.com/JSONPath-Plus/JSONPath for finding refs/selectors in resources.
* https://github.com/rjsf-team/react-jsonschema-form for generating forms for k8s resources.
* https://github.com/wbkd/react-flow for graph diagrams.
* https://github.com/tweenjs/es6-tween for animation tweening.
* https://github.com/pengx17/monaco-yaml for yaml support in the source editor.
* https://github.com/paulmillr/chokidar for file watching.
* https://github.com/ant-design/ant-design/ for UI.
* https://github.com/styled-components/styled-components for custom styling.

## Dev Dependencies

* https://github.com/gsoft-inc/craco for overriding CRA config for folder aliases,
  see https://www.npmjs.com/package/craco-alias#examples.

## K8s Schemas

Monokle currently uses the latest 1.22.1 schemas for validation and editor functionality - 
see [this issue](https://github.com/kubeshop/monokle/issues/321) for making schema version configurable. 

Schemas are currently taken from 
[https://github.com/yannh/kubernetes-json-schema](https://github.com/yannh/kubernetes-json-schema) - strict version
is used.
