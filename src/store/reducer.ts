import {SET_ROOT_FOLDER} from "./actionTypes";
import {AppState, SetRootFolderAction, FileEntry, K8sResource} from "../models/state";
import path from "path";

const initialState: AppState = {
  rootFolder: ".",
  files: [
    {
      name: "test.yaml",
      folder: ".",
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: [],
      resources: []
    }
  ],
  statusText: "Welcome!",
  appConfig: {
    scanExcludes: ['node_modules', '.git'],
    fileIncludes: ['yaml', 'yml'],
    navigators: [
      {
        name: "k8s resources",
        sections: [
          {
            name: "workloads",
            subsections: [
              {
                name: "deployments",
                apiVersionSelector: "*",
                kindSelector: "Deployment"
              }
            ]
          },
          {
            name: "config",
            subsections: [
              {
                name: "configmaps",
                apiVersionSelector: "*",
                kindSelector: "ConfigMap"
              }
            ]
          },
          {
            name: "network",
            subsections: [
              {
                name: "services",
                apiVersionSelector: "*",
                kindSelector: "Service"
              }
            ]
          }
        ]
      }
    ]
  },
  resourceMap: new Map(),
}

const fileReducer = (
  state: AppState = initialState,
  action: SetRootFolderAction
): AppState => {
  switch (action.type) {
    case SET_ROOT_FOLDER:
      if (action.rootEntry) {
        return reduceRootFolder(action.rootEntry, action.resourceMap, state);
      }
  }
  return state
}

function reduceRootFolder(rootEntry: FileEntry, resourceMap: Map<string, K8sResource>, state: AppState) {
  var rootFolder = path.join(rootEntry.folder, rootEntry.name);
  return {
    ...state,
    rootFolder: rootFolder,
    statusText: "Loaded folder " + rootFolder,
    resourceMap: resourceMap,
    files: rootEntry.children ? rootEntry.children : []
  }
}

export default fileReducer
