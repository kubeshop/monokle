const KEY_CTRL_CMD = process.platform === 'darwin' ? '⌘' : 'CTRL';

export const BrowseFolderTooltip = `Browse for folder containing manifests, kustomizations or Helm charts (${KEY_CTRL_CMD}+O)`;
export const ReloadFolderTooltip = `Reload manifests from the currently selected folder (${KEY_CTRL_CMD}+F5)`;
export const FileExplorerTooltip = 'Show/hide File Exlorer';
export const ClusterExplorerTooltip = 'Show/hide Cluster Preview';
export const BrowseKubeconfigTooltip = 'Browse for kubeconfig file';
export const ClusterModeTooltip = `Retrieve and show resources in configured cluster (${KEY_CTRL_CMD}+I)`;
export const KustomizationPreviewTooltip = 'Preview the output of this Kustomize file';
export const ExitKustomizationPreviewTooltip = 'Exit Kustomize preview (Escape)';
export const HelmPreviewTooltip = 'Preview the Helm chart with this values file';
export const ExitHelmPreviewTooltip = 'Exit Helm chart preview (Escape)';
export const ApplyTooltip = 'Apply this resource to your configured cluster';
export const DiffTooltip = 'Diff this resource against your configured cluster';
export const NamespacesFilterTooltip = 'Filter visible resources on selected namespace';
export const KubeconfigPathTooltip = 'The path to the kubeconfig to use for cluster/kubectl commands';
export const AddInclusionPatternTooltip = 'Add pattern for files that contain resource manifests';
export const AddExclusionPatternTooltip = 'Add pattern for files/folders to exclude when scanning for resources';
export const HelmPreviewModeTooltip = 'Set which Helm command to use when generating Helm previews';
