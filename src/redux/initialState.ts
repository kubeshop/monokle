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
                name: 'Pods',
                apiVersionSelector: '**',
                kindSelector: 'Pod',
              },
              {
                name: 'Deployments',
                apiVersionSelector: '**',
                kindSelector: 'Deployment',
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
                name: 'ReplicaSets',
                apiVersionSelector: '**',
                kindSelector: 'ReplicaSet',
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
              {
                name: 'Endpoints',
                apiVersionSelector: '**',
                kindSelector: 'Endpoints',
              },
            ],
          },
          {
            name: 'Storage',
            subsections: [
              {
                name: 'Persistent Volume Claims',
                apiVersionSelector: '**',
                kindSelector: 'PersistentVolumeClaim',
              },
              {
                name: 'Persistent Volumes',
                apiVersionSelector: '**',
                kindSelector: 'PersistentVolume',
              },
            ],
          },
          {
            name: 'Access Control',
            subsections: [
              {
                name: 'Service Accounts',
                apiVersionSelector: '**',
                kindSelector: 'ServiceAccount',
              },
              {
                name: 'ClusterRoles',
                apiVersionSelector: '**',
                kindSelector: 'ClusterRole',
              },
              {
                name: 'Roles',
                apiVersionSelector: '**',
                kindSelector: 'Role',
              },
              {
                name: 'ClusterRoleBindings',
                apiVersionSelector: '**',
                kindSelector: 'ClusterRoleBinding',
              },
              {
                name: 'RoleBindings',
                apiVersionSelector: '**',
                kindSelector: 'RoleBinding',
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
