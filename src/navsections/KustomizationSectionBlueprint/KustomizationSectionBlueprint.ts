import {KUSTOMIZATION_KIND} from '@constants/constants';

import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';

import {selectK8sResource} from '@redux/reducers/main';

import sectionBlueprintMap from '../sectionBlueprintMap';
import KustomizationPrefix from './KustomizationPrefix';
import KustomizationQuickAction from './KustomizationQuickAction';
import KustomizationSuffix from './KustomizationSuffix';

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

export const KUSTOMIZATION_SECTION_NAME = 'Kustomizations' as const;

const KustomizationSectionBlueprint: SectionBlueprint<K8sResource, KustomizationScopeType> = {
  name: KUSTOMIZATION_SECTION_NAME,
  id: KUSTOMIZATION_SECTION_NAME,
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
