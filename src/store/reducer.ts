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
      resourceIds: []
    }
  ],
  statusText: "Welcome!",
  appConfig: {
    scanExcludes: ['node_modules', '.git', '**/pkg/mod/**' ],
    fileIncludes: ['yaml', 'yml'],
    navigators: [
      {
        name: "K8s Resources",
        sections: [
          {
            name: "Workloads",
            subsections: [
              {
                name: "Deployments",
                apiVersionSelector: "**",
                kindSelector: "Deployment"
              }
            ]
          },
          {
            name: "Configuration",
            subsections: [
              {
                name: "ConfigMaps",
                apiVersionSelector: "**",
                kindSelector: "ConfigMap"
              }
            ]
          },
          {
            name: "Network",
            subsections: [
              {
                name: "Services",
                apiVersionSelector: "**",
                kindSelector: "Service"
              }
            ]
          }
        ]
      },
      {
        name: "Ambassador",
        sections: [
          {
            name: "Emissary",
            subsections: [
              {
                name: "Mappings",
                apiVersionSelector: "getambassador.io/*",
                kindSelector: "Mapping"
              }
            ]
          }
        ]
      },
      {
        name: "Prometheus",
        sections:[]
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
