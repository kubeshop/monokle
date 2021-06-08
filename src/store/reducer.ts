import {SELECT_KUSTOMIZATION, SET_FILTER_OBJECTS, SET_ROOT_FOLDER} from "./actionTypes";
import {AppConfig, AppState, FileEntry, K8sResource} from "../models/state";
import path from "path";
import {AnyAction} from "redux";

const initialState: AppState = {
  rootFolder: "",
  files: [],
  statusText: "Welcome!",
  appConfig: {
    settings: {
      filterObjectsOnSelection: true
    },
    scanExcludes: ['node_modules', '.git', '**/pkg/mod/**'],
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
          },
          {
            name: "Security",
            subsections: [
              {
                name: "ClusterRoles",
                apiVersionSelector: "**",
                kindSelector: "ClusterRole"
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
        sections: []
      }
    ]
  },
  resourceMap: new Map(),
  fileMap: new Map()
}

function setFilterObjects(appConfig: AppConfig, filterObjectsOnSelection: boolean) {
  return {
    ...appConfig,
    settings: {
      filterObjectsOnSelection: filterObjectsOnSelection
    }
  }
}

const fileReducer = (
  state: AppState = initialState,
  action: AnyAction
): AppState => {
  switch (action.type) {
    case SET_FILTER_OBJECTS:
      return {
        ...state,
        appConfig: setFilterObjects(state.appConfig, action.filterObjectsOnSelection)
      }
    case SET_ROOT_FOLDER:
      if (action.rootEntry) {
        return reduceRootFolder(action.rootEntry, action.resourceMap, action.fileMap, state);
      }
      break
    case SELECT_KUSTOMIZATION: //
      if (action.resourceIds) {
        action.resourceIds.forEach((e: string) => {
          const resource = state.resourceMap.get(e)
          if (resource) {
            resource.highlight = true
          }
        })
        return {
          ...state,
          resourceMap: state.resourceMap,
        }
      }
  }
  return state
}

function reduceRootFolder(rootEntry: FileEntry, resourceMap: Map<string, K8sResource>, fileMap: Map<string, FileEntry>, state: AppState) {
  var rootFolder = path.join(rootEntry.folder, rootEntry.name);
  return {
    ...state,
    rootFolder: rootFolder,
    statusText: "Loaded folder " + rootFolder,
    fileMap: fileMap,
    resourceMap: resourceMap,

    files: rootEntry.children ? rootEntry.children : []
  }
}

export default fileReducer
