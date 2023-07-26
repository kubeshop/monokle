import {HotkeyLabel} from '@atoms';

export const macOSKeyIcon: Record<string, string> = {
  alt: '⌥',
  Meta: '⌘',
  shift: '⇧',
};

export const ClusterExplorerTooltips = {
  default: 'Show/hide Cluster Connection',
  firstTimeSeeing: 'Configure your Kubeconfig path to enable Cluster features',
  noKubeconfigPath: 'Kubeconfig path is missing, configure it to enable Cluster features',
  notValidKubeconfigPath: 'The specified Kubeconfig path is not valid',
};
export const AddExclusionPatternTooltip = 'Add pattern for files/folders to exclude when scanning for resources';
export const AddInclusionPatternTooltip = 'Add pattern for files that contain resource manifests';
export const AddTerminalTooltip = 'Add new terminal';
export const AutoLoadLastProjectTooltip = 'Load last project when starting Monokle';
export const BrowseKubeconfigTooltip = 'Browse for kubeconfig file';
export const EditWithFormTooltip = 'Edit resource with form';
export const ClusterDiffDisabledInClusterPreviewTooltip =
  'Cluster Compare is disabled while previewing Cluster resources';
export const ClusterDiffDisabledTooltip = 'Browse for a folder to enable the Cluster Compare';
export const ClusterDiffSaveTooltip = 'Replace local resource with cluster version';
export const ClusterDiffTooltip = 'Compare your local resources with resources in your configured cluster';
export const ClusterNamespaceTooltip = 'Selected cluster namespace';
export const CollapseResourcesTooltip = 'Collapse all resources';
export const CollapseTreeTooltip = 'Collapse all folders';
export const CommitTooltip = 'Commit to the main branch';
export const DeletePreviewConfigurationTooltip = 'Are you sure you want to delete this Dry-run Configuration?';
export const DocumentationTooltip = 'Open Monokle Documentation Website';
export const EditPreviewConfigurationTooltip = 'Edit this Dry-run Configuration';
export const EnableHelmWithKustomizeTooltip = 'Enable helm-related functionality when invoking Kustomize';
export const ExitHelmPreviewTooltip = 'Exit Helm Chart preview (Escape)';
export const ExitKustomizationPreviewTooltip = 'Exit Kustomize preview (Escape)';
export const ExpandResourcesTooltip = 'Expand all resources';
export const ExpandTreeTooltip = 'Expand all folders';
export const FeedbackTooltip =
  'Monokle is open source and free of charge. Would you help us to improve it by dedicating 2 minutes to answer our questions?';
export const FileExplorerChanged = 'File Explorer has some changes. Reload it to see them.';
export const HelmPreviewModeTooltip = 'Set which Helm command to use when generating Helm previews';
export const HelmPreviewTooltip = 'Preview the Helm Chart with this values file';
export const ImageTagTooltip = 'Open in external browser';
export const InitializeGitTooltip = 'Make your project a Git repository';
export const InstallGitTooltip = 'Git is not installed';
export const KillTerminalTooltip = 'Kill terminal';
export const KubeConfigNoValid = 'Your kubeconfig is not valid !';
export const KubeconfigPathTooltip = 'The path to the kubeconfig to use for cluster/kubectl commands';
export const KustomizeCommandTooltip = 'Set how to invoke kustomize when previewing and deploying kustomization files';
export const KustomizationPreviewTooltip = 'Preview the output of this Kustomize file';
export const NewEmptyProjectTooltip = 'New Empty Project';
export const NewPreviewConfigurationTooltip = 'Create a new Dry-run Configuration';
export const NewProjectFromFolderTooltip = 'New project from existing folder';
export const NewProjectFromGitTooltip = 'New project from Git repository';
export const NewProjectFromTemplateTooltip = 'New Project from Template';
export const NewResourceTooltip = 'Create new resource';
export const NotificationsTooltip = 'Show latest notifications';
export const OpenExternalDocumentationTooltip = 'Open documentation for this resource type in external browser';
export const OpenHelmChartDocumentationTooltip = 'Open documentation for Helm Charts in external browser';
export const OpenKustomizeDocumentationTooltip = 'Open documentation for Kustomize in external browser';
export const PluginManagerReloadTooltip = 'Updates all plugins that have a newer version available';
export const ProjectManagementTooltip = 'Select and manage your projects';
export const ReloadHelmPreviewTooltip = 'Reload the Helm Chart preview with this values file';
export const ReloadKustomizationPreviewTooltip = 'Reload the preview of this Kustomization';
export const RunPreviewConfigurationTooltip = 'Run this Dry-run Configuration';
export const InstallPreviewConfigurationTooltip = 'Install this Dry-run Configuration to the cluster.';
export const SaveTransientResourceTooltip = 'Save resource to file/folder';
export const SearchProjectTooltip = 'Search for project by name or path';
export const TelemetryDocumentationUrl = 'https://kubeshop.github.io/monokle/telemetry';
export const TemplateManagerPaneReloadTooltip = 'Updates all templates that have a newer version available';
export const TemplatesTabTooltip = `View Templates`;
export const ValidationLevelSelectTooltip =
  'Select how you want the violation of this rule to be highlighted in your code.';

export const ApplyFileTooltip = () => (
  <HotkeyLabel text="Deploy this file to your selected cluster" name="APPLY_SELECTION" />
);
export const ApplyTooltip = () => (
  <HotkeyLabel text="Deploy this resource to your selected cluster" name="APPLY_SELECTION" />
);
export const ClusterModeTooltip = () => (
  <HotkeyLabel text="Retrieve and show resources in selected context" name="LOAD_CLUSTER" />
);
export const DiffTooltip = () => (
  <HotkeyLabel text="Diff this resource against your selected cluster" name="DIFF_RESOURCE" />
);
export const FileExplorerTabTooltip = () => <HotkeyLabel text="View File Explorer" name="OPEN_EXPLORER_TAB" />;
export const InstallValuesFileTooltip = () => (
  <HotkeyLabel text="Install Helm Chart using this values file in your selected cluster" name="APPLY_SELECTION" />
);

export const QuickFilterTooltip = () => <HotkeyLabel text="Filter results" name="OPEN_QUICK_SEARCH" />;
export const ReloadFolderTooltip = () => (
  <HotkeyLabel text="Reload manifests from the currently selected folder" name="REFRESH_FOLDER" />
);
export const ResetFiltersTooltip = () => <HotkeyLabel text="Reset Filters" name="RESET_RESOURCE_FILTERS" />;
export const SettingsTooltip = () => <HotkeyLabel text="Open Settings" name="TOGGLE_SETTINGS" />;
export const ValidationTabTooltip = () => <HotkeyLabel text="View Validation" name="OPEN_VALIDATION_TAB" />;
export const TerminalPaneTooltip = () => <HotkeyLabel text="View Terminal" name="TOGGLE_TERMINAL_PANE" />;

export const ScaleTooltip = () => <HotkeyLabel text="Change the number of replicas" name="SCALE" />;
export const RestartTooltip = 'Restart deployment';

export const GitCommitDisabledTooltip = 'There are no staged files to commit';
export const GitCommitEnabledTooltip = ({branchName}: {branchName: string}) => (
  <div>Commit staged files to {branchName}</div>
);
export const ClusterDashboardErrorsWarningTooltip = ({type}: {type: 'errors' | 'warnings'}) => (
  <div>Click to see all your cluster {type}</div>
);
export const DisabledAddResourceTooltip = ({type, kind}: {type: 'cluster' | 'preview' | 'other'; kind?: string}) =>
  type === 'other' ? (
    <div>Adding a resource is not possible</div>
  ) : (
    <div>
      Adding a {kind || 'resource'} is not possible in {type === 'cluster' ? 'cluster' : 'preview'} mode
    </div>
  );
