import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {selectK8sResource} from '@redux/reducers/main';
import {NavSection} from '@models/navsection';
import KustomizationQuickAction from './KustomizationQuickAction';
import KustomizationPrefix from './KustomizationPrefix';
import KustomizationSuffix from './KustomizationSuffix';

export type KustomizationNavSectionScope = {
  resourceMap: ResourceMapType;
  previewResourceId: string | undefined;
  isInClusterMode: boolean;
  isFolderLoading: boolean;
  selectedPath: string | undefined;
  selectedResourceId: string | undefined;
  isPreviewLoading: boolean;
  isKustomizationPreview: boolean;
};

const KustomizationNavSection: NavSection<K8sResource, KustomizationNavSectionScope> = {
  name: 'Kustomizations',
  id: 'kustomizations',
  getScope: state => {
    return {
      resourceMap: state.main.resourceMap,
      previewResourceId: state.main.previewResourceId,
      isFolderLoading: state.ui.isFolderLoading,
      isInClusterMode: Boolean(
        state.main.previewResourceId && state.main.previewResourceId.endsWith(state.config.kubeconfigPath)
      ),
      selectedPath: state.main.selectedPath,
      selectedResourceId: state.main.selectedResourceId,
      isPreviewLoading: state.main.previewLoader.isLoading,
      isKustomizationPreview: state.main.previewType === 'kustomization',
    };
  },
  getItems: scope => {
    return Object.values(scope.resourceMap)
      .filter(i => i.kind === 'Kustomization')
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  isLoading: scope => {
    if (scope.isPreviewLoading && !scope.isKustomizationPreview) {
      return true;
    }
    return scope.isFolderLoading;
  },
  isVisible: scope => {
    return !scope.isInClusterMode;
  },
  itemHandler: {
    getName: item => item.name,
    getIdentifier: item => item.id,
    isSelected: (item, scope) => item.isSelected || scope.previewResourceId === item.id,
    isHighlighted: item => item.isHighlighted,
    isDisabled: (item, scope) => Boolean(scope.previewResourceId && scope.previewResourceId !== item.id),
    onClick: (item, scope, dispatch) => {
      dispatch(selectK8sResource({resourceId: item.id}));
    },
    shouldScrollIntoView: (item, scope) => {
      if (item.isHighlighted && scope.selectedPath) {
        return true;
      }
      if (item.isSelected && scope.selectedResourceId) {
        return true;
      }
      return false;
    },
  },
  itemCustomization: {
    Prefix: KustomizationPrefix,
    Suffix: KustomizationSuffix,
    QuickAction: KustomizationQuickAction,
  },
};

export default KustomizationNavSection;
