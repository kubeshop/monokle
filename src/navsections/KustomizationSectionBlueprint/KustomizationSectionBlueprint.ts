import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {selectK8sResource} from '@redux/reducers/main';
import {SectionBlueprint} from '@models/navigator';
import {KUSTOMIZATION_KIND} from '@constants/constants';
import KustomizationQuickAction from './KustomizationQuickAction';
import KustomizationPrefix from './KustomizationPrefix';
import KustomizationSuffix from './KustomizationSuffix';
import sectionBlueprintMap from '../sectionBlueprintMap';

export type KustomizationScopeType = {
  resourceMap: ResourceMapType;
  previewResourceId: string | undefined;
  isInClusterMode: boolean;
  isFolderLoading: boolean;
  selectedPath: string | undefined;
  selectedResourceId: string | undefined;
  isPreviewLoading: boolean;
  isKustomizationPreview: boolean;
};

const KustomizationSectionBlueprint: SectionBlueprint<K8sResource, KustomizationScopeType> = {
  name: 'Kustomizations',
  id: 'Kustomizations',
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
  builder: {
    getRawItems: scope => {
      return Object.values(scope.resourceMap)
        .filter(i => i.kind === KUSTOMIZATION_KIND)
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
    isInitialized: (_, rawItems) => {
      return rawItems.length > 0;
    },
    shouldBeVisibleBeforeInitialized: true,
  },
  itemBlueprint: {
    getName: rawItem => rawItem.name,
    getInstanceId: rawItem => rawItem.id,
    builder: {
      isSelected: (rawItem, scope) => rawItem.isSelected || scope.previewResourceId === rawItem.id,
      isHighlighted: rawItem => rawItem.isHighlighted,
      isDisabled: (rawItem, scope) => Boolean(scope.previewResourceId && scope.previewResourceId !== rawItem.id),
      shouldScrollIntoView: (rawItem, scope) => {
        if (rawItem.isHighlighted && scope.selectedPath) {
          return true;
        }
        if (rawItem.isSelected && scope.selectedResourceId) {
          return true;
        }
        return false;
      },
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        dispatch(selectK8sResource({resourceId: itemInstance.id}));
      },
    },
    customization: {
      prefix: {component: KustomizationPrefix},
      suffix: {component: KustomizationSuffix},
      quickAction: {component: KustomizationQuickAction, options: {isVisibleOnHover: true}},
    },
  },
};

sectionBlueprintMap.register(KustomizationSectionBlueprint);

export default KustomizationSectionBlueprint;
