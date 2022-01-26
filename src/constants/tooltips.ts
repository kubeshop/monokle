const KEY_CTRL_CMD = process.platform === 'darwin' ? '⌘' : 'CTRL';

export const BrowseFolderTooltip = `Browse for folder containing manifests, kustomizations or Helm charts (${KEY_CTRL_CMD}+O)`;
export const ReloadFolderTooltip = `Reload manifests from the currently selected folder (${KEY_CTRL_CMD}+F5)`;
export const ToggleTreeTooltip = 'Expand/Collapse all folders';
export const FileExplorerTooltip = 'Show/hide File Exlorer';
export const ClusterExplorerTooltips = {
  default: 'Show/hide Cluster Preview',
  firstTimeSeeing: 'Configure your Kubeconfig path to enable Cluster features',
  noKubeconfigPath: 'Kubeconfig path is missing, configure it to enable Cluster features',
  notValidKubeconfigPath: 'The specified Kubeconfig path is not valid',
};
export const ClusterDiffTooltip = 'Compare your local resources with resources in your configured cluster';
export const ClusterDiffDisabledTooltip = 'Browse for a folder to enable the Cluster Compare';
export const ClusterDiffDisabledInClusterPreviewTooltip =
  'Cluster Compare is disabled while previewing Cluster resources';
export const BrowseKubeconfigTooltip = 'Browse for kubeconfig file';
export const ClusterModeTooltip = `Retrieve and show resources in selected context (${KEY_CTRL_CMD}+I)`;
export const KustomizationPreviewTooltip = 'Preview the output of this Kustomize file';
export const ExitKustomizationPreviewTooltip = 'Exit Kustomize preview (Escape)';
export const ReloadKustomizationPreviewTooltip = 'Reload the preview of this Kustomization';
export const HelmPreviewTooltip = 'Preview the Helm Chart with this values file';
export const ReloadHelmPreviewTooltip = 'Reload the Helm Chart preview with this values file';
export const ExitHelmPreviewTooltip = 'Exit Helm Chart preview (Escape)';
export const ApplyFileTooltip = `Apply this file to your configured cluster (${KEY_CTRL_CMD}+ALT+S)`;
export const ApplyTooltip = `Apply this resource to your configured cluster (${KEY_CTRL_CMD}+ALT+S)`;
export const DiffTooltip = `Diff this resource against your configured cluster (${KEY_CTRL_CMD}+ALT+D)`;
export const NamespacesFilterTooltip = 'Filter visible resources on selected namespace';
export const KubeconfigPathTooltip = 'The path to the kubeconfig to use for cluster/kubectl commands';
export const AddInclusionPatternTooltip = 'Add pattern for files that contain resource manifests';
export const AddExclusionPatternTooltip = 'Add pattern for files/folders to exclude when scanning for resources';
export const HelmPreviewModeTooltip = 'Set which Helm command to use when generating Helm previews';
export const KustomizeCommandTooltip = 'Set how to invoke kustomize when previewing and applying kustomization files';
export const AutoLoadLastFolderTooltip = 'Load last folder when starting Monokle';
export const SaveUnsavedResourceTooltip = 'Save resource to file/folder';
export const AutoLoadLastProjectTooltip = 'Load last project when starting Monokle';
export const EnableHelmWithKustomizeTooltip = 'Enable helm-related functionality when invoking Kustomize';
export const ClusterDiffApplyTooltip = 'Deploy this resource to your configured cluster';
export const ClusterDiffSaveTooltip = 'Replace local resource with cluster version';
export const ClusterDiffCompareTooltip = 'Diff resources - Opens the Diff Modal';
export const FileExplorerChanged = 'File Explorer has some changes. Reload it to see them.';
export const OpenExternalDocumentationTooltip = 'Open documentation for this resource type in external browser';
export const TemplateManagerPaneReloadTooltip = 'Updates all templates that have a newer version available';
export const PluginManagerDrawerReloadTooltip = 'Updates all plugins that have a newer version available';
export const DocumentationTooltip = 'Open Monokle Documentation Website';
export const DiscordTooltip = 'Open Kubeshop Discord Server';
export const GitHubTooltip = 'Open Monokle Github Repository';
export const SettingsTooltip = 'Open Settings';
export const NotificationsTooltip = 'Show latest notifications';
export const ProjectManagementTooltip = 'Select and manage your projects';
export const NewProjectFromTemplateTooltip = 'New Project from Template';
export const NewProjectFromFolderTooltip = 'New project from existing folder';
export const NewEmptyProjectTooltip = 'New Empty Project';
export const SearchProjectTooltip = 'Search for project by name or path';
export const PluginDrawerTooltip = 'Open Plugins Manager';
export const QuickFilterTooltip = 'quick-filter CTRL + P';
