import textExtensions from 'text-extensions';

import {PaneConfiguration} from '@shared/models/ui';
import {Colors} from '@shared/styles/colors';

export const CLUSTER_DIFF_PREFIX = 'clusterDiff://';
export const YAML_DOCUMENT_DELIMITER = '---';
export const YAML_DOCUMENT_DELIMITER_NEW_LINE = '---\n';
export const TOOLTIP_DELAY = 1.0;
export const LONGER_TOOLTIP_DELAY = 2.0;
export const TOOLTIP_K8S_SELECTION = 'Select which kubernetes schema version to use for validation';
export const REF_PATH_SEPARATOR = '#';
export const KUSTOMIZATION_FILE_NAME = 'kustomization.yaml';
export const KUSTOMIZATION_KIND = 'Kustomization';
export const KUSTOMIZATION_API_GROUP = 'kustomize.config.k8s.io';
export const KUSTOMIZATION_API_VERSION = `${KUSTOMIZATION_API_GROUP}/v1beta1`;
export const KUSTOMIZE_HELP_URL = 'https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/';
export const HELM_CHART_HELP_URL = 'https://helm.sh/docs/topics/charts/';
export const DEFAULT_EDITOR_DEBOUNCE = 500;
export const DEFAULT_KUBECONFIG_DEBOUNCE = 1000;
export const DEFAULT_PANE_TITLE_HEIGHT = 40;
export const MIN_SPLIT_VIEW_PANE_WIDTH = 350;
export const GUTTER_SPLIT_VIEW_PANE_WIDTH = 15;
export const VALIDATION_HIDING_LABELS_WIDTH = 450;
export const DEFAULT_GIT_REPO_PLACEHOLDER = 'https://github.com/kubeshop/monokle-demo';
export const TEMPLATES_HELP_URL = 'https://github.com/kubeshop/monokle/blob/main/docs/templates.md';
export const PLUGINS_HELP_URL = 'https://kubeshop.github.io/monokle/plugins';

export const DISCORD_URL = 'https://discord.gg/kMJxmuYTMu';

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
};

export const PANE_CONSTRAINT_VALUES = {
  minEditPane: 450,
  navPane: 330,
};

export const HELM_CHART_ENTRY_FILE = 'Chart.yaml';
export const HELM_CHART_SECTION_NAME = 'Local Helm Charts';
export const HELM_TEMPLATE_OPTIONS_DOCS_URL = 'https://helm.sh/docs/helm/helm_template/#options';
export const HELM_INSTALL_OPTIONS_DOCS_URL = 'https://helm.sh/docs/helm/helm_install/#options';

export const GIT_ERROR_MODAL_DESCRIPTION = 'Check terminal for more information.';
export const VALID_URL_REGEX =
  /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
export const VALID_IMAGE_NAME_REGEX =
  /^(?:(?=[^:\/]{1,253})(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(?:\\.(?!-)[a-zA-Z0-9-]{1,63}(?<!-))*(?::[0-9]{1,5})?\/)?((?![._-])(?:[a-z0-9._-]*)(?<![._-])(?:\/(?![._-])[a-z0-9._-]*(?<![._-]))*)(?::(?![.-])[a-zA-Z0-9_.-]{1,128})?$/;
export const VALID_RESOURCE_NAME_REGEX = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
export const ADDITIONAL_SUPPORTED_FILES = [
  '.monokle',
  '.gitignore',
  'Dockerfile',
  'LICENSE',
  '.helmignore',
  'database.env',
  '.dockerignore',
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  '.github',
  '.vscode',
];

export const CLUSTER_DASHBOARD_HELP_URL: string = 'https://kubeshop.github.io/monokle/cluster-mode';
export const SUPPORTED_TEXT_EXTENSIONS = ['.md', '.yaml', '.yml'];
export const ALL_TEXT_EXTENSIONS = [...textExtensions, ...SUPPORTED_TEXT_EXTENSIONS, ...ADDITIONAL_SUPPORTED_FILES];
