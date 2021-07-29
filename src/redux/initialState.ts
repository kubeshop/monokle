import {AppState} from '@models/appstate';
import electronStore from '@utils/electronStore';

export const initialState: AppState = {
  appConfig: {
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
              {
                name: 'Pods',
                apiVersionSelector: '**',
                kindSelector: 'Pod',
              },
              {
                name: 'DaemonSets',
                apiVersionSelector: '**',
                kindSelector: 'DaemonSet',
              },
              {
                name: 'StatefulSets',
                apiVersionSelector: '**',
                kindSelector: 'StatefulSet',
              },
              {
                name: 'Jobs',
                apiVersionSelector: '**',
                kindSelector: 'Job',
              },
              {
                name: 'CronJobs',
                apiVersionSelector: '**',
                kindSelector: 'CronJob',
              },
              {
                name: 'ReplicationControllers',
                apiVersionSelector: '**',
                kindSelector: 'ReplicationController',
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
              {
                name: 'Secrets',
                apiVersionSelector: '**',
                kindSelector: 'Secret',
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
            name: 'Access Control',
            subsections: [
              {
                name: 'ClusterRoles',
                apiVersionSelector: '**',
                kindSelector: 'ClusterRole',
              },
              {
                name: 'Service Accounts',
                apiVersionSelector: '**',
                kindSelector: 'ServiceAccount',
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
};
