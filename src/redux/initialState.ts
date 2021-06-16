import {AppState} from "../models/state";

export const initialState: AppState = {
  rootFolder: "",
  rootEntry: {
    name:"",
    folder :"",
    selected:false,
    highlight:false,
    expanded:false,
    excluded:false
  },
  appConfig: {
    settings: {
      filterObjectsOnSelection: false,
      autoZoomGraphOnSelection: true,
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
      }
    ]
  },
  resourceMap: {}
}
