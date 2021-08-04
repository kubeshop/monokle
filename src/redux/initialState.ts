import {AppState} from '@models/appstate';
import electronStore from '@utils/electronStore';

export const initialState: AppState = {
  appConfig: {
    startupModalVisible: electronStore.get('appConfig.startupModalVisible'),
    kubeconfig: '',
    settings: {
      filterObjectsOnSelection: false,
      autoZoomGraphOnSelection: true,
      helmPreviewMode: electronStore.get('appConfig.settings.helmPreviewMode') || 'template',
      theme: electronStore.get('appConfig.settings.theme'),
      textSize: electronStore.get('appConfig.settings.textSize'),
      language: electronStore.get('appConfig.settings.language'),
    },
    scanExcludes: electronStore.get('appConfig.scanExcludes'),
    fileIncludes: electronStore.get('appConfig.fileIncludes'),
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
  previewLoader: {
    isLoading: false,
  },
  isSelectingFile: false,
  isSelectingResource: false,
};
