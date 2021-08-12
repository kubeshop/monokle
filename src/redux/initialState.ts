import {AppState} from '@models/appstate';
import {AppConfig} from '@models/appconfig';
import {AlertState} from '@models/alert';
import {LogsState} from '@models/logs';
import {UiState} from '@models/ui';
import electronStore from '@utils/electronStore';

const initialAppState: AppState = {
  resourceMap: {},
  fileMap: {},
  helmChartMap: {},
  helmValuesMap: {},
  previewLoader: {
    isLoading: false,
  },
  isSelectingFile: false,
  isApplyingResource: false,
};

const initialAppConfigState: AppConfig = {
  isStartupModalVisible: electronStore.get('appConfig.startupModalVisible'),
  kubeconfigPath: '',
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
            {
              name: 'Ingresses',
              apiVersionSelector: '**',
              kindSelector: 'Ingress',
            },
            {
              name: 'NetworkPolicies',
              apiVersionSelector: '**',
              kindSelector: 'NetworkPolicy',
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
        {
          name: 'Custom Resources',
          subsections: [
            {
              name: 'Definitions',
              apiVersionSelector: '**',
              kindSelector: 'CustomResourceDefinition',
            },
          ],
        },
      ],
    },
  ],
};

const initialAlertState: AlertState = {};

const initialLogsState: LogsState = {
  logs: [''],
};

const initialUiState: UiState = {
  isSettingsOpen: false,
  isFolderLoading: false,
  leftMenu: {
    selection: 'file-explorer',
    isActive: true,
  },
  rightMenu: {
    isActive: false,
  },
};

export default {
  alert: initialAlertState,
  config: initialAppConfigState,
  main: initialAppState,
  logs: initialLogsState,
  ui: initialUiState,
};
