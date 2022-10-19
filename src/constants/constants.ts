import {PaneConfiguration} from '@models/ui';

import Colors from '../styles/Colors';

export const PREVIEW_PREFIX = 'preview://';
export const CLUSTER_DIFF_PREFIX = 'clusterDiff://';
export const UNSAVED_PREFIX = 'unsaved://';
export const YAML_DOCUMENT_DELIMITER = '---';
export const YAML_DOCUMENT_DELIMITER_NEW_LINE = '---\n';
export const ROOT_FILE_ENTRY = '<root>';
export const APP_MIN_WIDTH = 800;
export const APP_MIN_HEIGHT = 600;
export const TOOLTIP_DELAY = 1.0;
export const LONGER_TOOLTIP_DELAY = 2.0;
export const TOOLTIP_K8S_SELECTION = 'Select which kubernetes schema version to use for validation';
export const ERROR_MSG_FALLBACK = 'Looks like something unexpected went wrong. Please try again later.';
export const REF_PATH_SEPARATOR = '#';
export const KUSTOMIZATION_FILE_NAME = 'kustomization.yaml';
export const KUSTOMIZATION_KIND = 'Kustomization';
export const KUSTOMIZATION_API_GROUP = 'kustomize.config.k8s.io';
export const KUSTOMIZATION_API_VERSION = `${KUSTOMIZATION_API_GROUP}/v1beta1`;
export const KUSTOMIZE_HELP_URL = 'https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/';
export const HELM_CHART_HELP_URL = 'https://helm.sh/docs/topics/charts/';
export const DEPENDENCIES_HELP_URL = 'https://kubeshop.github.io/monokle/getting-started/#install-dependencies';
export const DEFAULT_EDITOR_DEBOUNCE = 500;
export const DEFAULT_KUBECONFIG_DEBOUNCE = 1000;
export const DEFAULT_PANE_TITLE_HEIGHT = 50;
export const MIN_SPLIT_VIEW_PANE_WIDTH = 350;
export const GUTTER_SPLIT_VIEW_PANE_WIDTH = 15;
export const VALIDATION_HIDING_LABELS_WIDTH = 450;
export const DEFAULT_TEMPLATES_PLUGIN_URL = 'https://github.com/kubeshop/monokle-default-templates-plugin';
export const DEFAULT_GIT_REPO_PLACEHOLDER = 'https://github.com/kubeshop/monokle/';
export const TEMPLATES_HELP_URL = 'https://github.com/kubeshop/monokle/blob/main/docs/templates.md';
export const PLUGINS_HELP_URL = 'https://github.com/kubeshop/monokle/blob/main/docs/plugins.md';
export const DEFAULT_PLUGINS = [
  {
    owner: 'kubeshop',
    name: 'monokle-default-templates-plugin',
    url: DEFAULT_TEMPLATES_PLUGIN_URL,
  },
];
export const PLUGIN_DOCS_URL = 'https://kubeshop.github.io/monokle/plugins/';
export const LET_US_KNOW_URL = 'https://github.com/kubeshop/monokle/issues/1550';
export const CLUSTER_AVAILABLE_COLORS = [
  Colors.yellow10,
  Colors.green6,
  Colors.volcano7,
  Colors.magenta8,
  Colors.blue9,
  Colors.lime8,
  Colors.red7,
  Colors.magenta7,
  Colors.purple8,
];

export const DEFAULT_PANE_CONFIGURATION: PaneConfiguration = {
  leftPane: 0.25,
  navPane: 0.25,
  editPane: 0,
  bottomPaneHeight: 250,
  recentProjectsPaneWidth: 450,
};

export const PANE_CONSTRAINT_VALUES = {
  minEditPane: 400,
  navPane: 330,
};

export const PREDEFINED_K8S_VERSION = '1.24.6';

export const K8S_VERSIONS = [
  '1.25.2',
  '1.25.1',
  '1.25.0',
  '1.24.6',
  '1.24.5',
  '1.24.4',
  '1.24.3',
  '1.24.2',
  '1.24.1',
  '1.24.0',
  '1.23.12',
  '1.23.11',
  '1.23.10',
  '1.23.9',
  '1.23.8',
  '1.23.7',
  '1.23.6',
  '1.23.5',
  '1.23.4',
  '1.23.3',
  '1.23.2',
  '1.23.1',
  '1.23.0',
  '1.22.6',
  '1.22.5',
  '1.22.4',
  '1.22.3',
  '1.22.2',
  '1.22.1',
  '1.22.0',
  '1.21.9',
  '1.21.8',
  '1.21.7',
  '1.21.6',
  '1.21.5',
  '1.21.4',
  '1.21.3',
  '1.21.2',
  '1.21.1',
  '1.21.0',
  '1.20.15',
  '1.20.14',
  '1.20.13',
  '1.20.12',
  '1.20.11',
  '1.20.10',
  '1.20.9',
  '1.20.8',
  '1.20.7',
  '1.20.6',
  '1.20.5',
  '1.20.4',
  '1.20.3',
  '1.20.2',
  '1.20.1',
  '1.20.0',
  '1.19.16',
  '1.19.15',
  '1.19.14',
  '1.19.13',
  '1.19.12',
  '1.19.11',
  '1.19.10',
  '1.19.9',
  '1.19.8',
  '1.19.7',
  '1.19.6',
  '1.19.5',
  '1.19.4',
  '1.19.3',
  '1.19.2',
  '1.19.1',
  '1.19.0',
  '1.18.20',
  '1.18.19',
  '1.18.18',
  '1.18.17',
  '1.18.16',
  '1.18.15',
  '1.18.14',
  '1.18.13',
  '1.18.12',
  '1.18.11',
  '1.18.10',
  '1.18.9',
  '1.18.8',
  '1.18.7',
  '1.18.6',
  '1.18.5',
  '1.18.4',
  '1.18.3',
  '1.18.2',
  '1.18.1',
  '1.18.0',
  '1.17.17',
  '1.17.16',
  '1.17.15',
  '1.17.14',
  '1.17.13',
  '1.17.12',
  '1.17.11',
  '1.17.10',
  '1.17.9',
  '1.17.8',
  '1.17.7',
  '1.17.6',
  '1.17.5',
  '1.17.4',
  '1.17.3',
  '1.17.2',
  '1.17.1',
  '1.17.0',
  '1.16.15',
  '1.16.14',
  '1.16.13',
  '1.16.12',
  '1.16.11',
  '1.16.10',
  '1.16.9',
  '1.16.8',
  '1.16.7',
  '1.16.6',
  '1.16.5',
  '1.16.4',
  '1.16.3',
  '1.16.2',
  '1.16.1',
  '1.16.0',
  '1.15.12',
  '1.15.11',
  '1.15.10',
  '1.15.9',
  '1.15.8',
  '1.15.7',
  '1.15.6',
  '1.15.5',
  '1.15.4',
  '1.15.3',
  '1.15.2',
  '1.15.1',
  '1.15.0',
];

export const HELM_CHART_ENTRY_FILE = 'Chart.yaml';
export const HELM_CHART_SECTION_NAME = 'Helm Charts';
export const HELM_TEMPLATE_OPTIONS_DOCS_URL = 'https://helm.sh/docs/helm/helm_template/#options';
export const HELM_INSTALL_OPTIONS_DOCS_URL = 'https://helm.sh/docs/helm/helm_install/#options';
export const NEW_VERSION_CHECK_INTERVAL = 24 * 60 * 60 * 1000;
export const GIT_ERROR_MODAL_DESCRIPTION = 'Check terminal for more information.';
export const VALID_URL_REGEX =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
