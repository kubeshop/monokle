import {AppState} from '@models/appstate';
import {Themes, TextSizes, Languages} from "@models/appconfig";

import {PROCESS_ENV} from "@utils/env";

export const initialState: AppState = {
  appConfig: {
    kubeconfig: PROCESS_ENV.KUBECONFIG,
    settings: {
      filterObjectsOnSelection: false,
      autoZoomGraphOnSelection: true,
      helmPreviewMode: 'template',
      theme: Themes.Dark,
      textSize: TextSizes.Medium,
      language: Languages.English,
    },
    scanExcludes: ['node_modules', '**/.git', '**/pkg/mod/**', '**/.kube'],
    fileIncludes: ['*.yaml', '*.yml'],
    navigators: [
      {
        name: 'K8s Resources',
        sections: [
          {
            name: 'Workloads',
            subsections: [
              {
                name: 'Deployments',
                apiVersionSelector: '**',
                kindSelector: 'Deployment',
              },
            ],
          },
          {
            name: 'Configuration',
            subsections: [
              {
                name: 'ConfigMaps',
                apiVersionSelector: '**',
                kindSelector: 'ConfigMap',
              },
            ],
          },
          {
            name: 'Network',
            subsections: [
              {
                name: 'Services',
                apiVersionSelector: '**',
                kindSelector: 'Service',
              },
            ],
          },
          {
            name: 'Security',
            subsections: [
              {
                name: 'ClusterRoles',
                apiVersionSelector: '**',
                kindSelector: 'ClusterRole',
              },
            ],
          },
        ],
      },
    ],
  },
  resourceMap: {},
  fileMap: {},
  helmChartMap: {},
  helmValuesMap: {},
};
