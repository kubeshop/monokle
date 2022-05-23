import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';

import {selectK8sResource} from '@redux/reducers/main';
import {isKustomizationResource} from '@redux/services/kustomize';

import {KUSTOMIZE_PATCH_SECTION_NAME} from '../KustomizePatchSectionBlueprint';
import sectionBlueprintMap from '../sectionBlueprintMap';
import KustomizationContextMenu from './KustomizationContextMenu';
import KustomizationContextMenuWrapper from './KustomizationContextMenuWrapper';
import KustomizationPrefix from './KustomizationPrefix';
import KustomizationQuickAction from './KustomizationQuickAction';
import KustomizationSectionEmptyDisplay from './KustomizationSectionEmptyDisplay';
import KustomizationSuffix from './KustomizationSuffix';

export type KustomizationScopeType = {
  resourceMap: ResourceMapType;
  previewResourceId: string | undefined;
  isInClusterMode: boolean;
  isFolderOpen: boolean;
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
  rootSectionId: KUSTOMIZE_PATCH_SECTION_NAME,
  getScope: state => {
    const kubeConfigPath = state.config.projectConfig?.kubeConfig?.path || state.config.kubeConfig.path;
    return {
      resourceMap: state.main.resourceMap,
      previewResourceId: state.main.previewResourceId,
      isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      isFolderLoading: state.ui.isFolderLoading,
      isInClusterMode: kubeConfigPath
        ? Boolean(state.main.previewResourceId && state.main.previewResourceId.endsWith(kubeConfigPath))
        : false,
      selectedPath: state.main.selectedPath,
      selectedResourceId: state.main.selectedResourceId,
      isPreviewLoading: state.main.previewLoader.isLoading,
      isKustomizationPreview: state.main.previewType === 'kustomization',
    };
  },
  builder: {
    getRawItems: scope => {
      return Object.values(scope.resourceMap)
        .filter(i => isKustomizationResource(i))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    isLoading: scope => {
      if (scope.isPreviewLoading && !scope.isKustomizationPreview) {
        return true;
      }
      return scope.isFolderLoading;
    },
    isInitialized: scope => {
      return scope.isFolderOpen;
    },
    isEmpty: (scope, rawItems) => {
      return scope.isFolderOpen && rawItems.length === 0;
    },
    shouldBeVisibleBeforeInitialized: true,
  },
  customization: {
    emptyDisplay: {
      component: KustomizationSectionEmptyDisplay,
    },
    beforeInitializationText: 'Get started by browsing a folder in the File Explorer.',
    counterDisplayMode: 'items',
  },
  itemBlueprint: {
    getName: rawItem => rawItem.name,
    getInstanceId: rawItem => rawItem.id,
    builder: {
      isSelected: (rawItem, scope) => rawItem.isSelected || scope.previewResourceId === rawItem.id,
      isHighlighted: rawItem => rawItem.isHighlighted,
      isDisabled: (rawItem, scope) =>
        Boolean((scope.previewResourceId && scope.previewResourceId !== rawItem.id) || scope.isInClusterMode),
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        dispatch(selectK8sResource({resourceId: itemInstance.id}));
      },
    },
    customization: {
      prefix: {component: KustomizationPrefix},
      suffix: {component: KustomizationSuffix},
      contextMenuWrapper: {component: KustomizationContextMenuWrapper, options: {isVisibleOnHover: false}},
      contextMenu: {component: KustomizationContextMenu, options: {isVisibleOnHover: true}},
      quickAction: {component: KustomizationQuickAction, options: {isVisibleOnHover: true}},
    },
  },
};

sectionBlueprintMap.register(KustomizationSectionBlueprint);

export default KustomizationSectionBlueprint;
