import {ResourceFilterType, ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';

import {selectK8sResource} from '@redux/reducers/main';

import sectionBlueprintMap from '../sectionBlueprintMap';
import KustomizePatchPrefix from './KustomizePatchPrefix';
import KustomizePatchSuffix from './KustomizePatchSuffix';

export type KustomizePatchScopeType = {
  resourceMap: ResourceMapType;
  resourceFilter: ResourceFilterType;
  selectedPath?: string;
  selectedResourceId?: string;
  isInClusterMode: boolean;
  isPreviewLoading: boolean;
  isFolderLoading: boolean;
};

export const KUSTOMIZE_PATCH_SECTION_NAME = 'Patch Resources' as const;

const KustomizePatchSectionBlueprint: SectionBlueprint<K8sResource, KustomizePatchScopeType> = {
  name: KUSTOMIZE_PATCH_SECTION_NAME,
  id: KUSTOMIZE_PATCH_SECTION_NAME,
  rootSectionId: KUSTOMIZE_PATCH_SECTION_NAME,
  containerElementId: 'kustomize-sections-container',
  getScope: state => {
    const kubeConfigPath = state.config.projectConfig?.kubeConfig?.path || state.config.kubeConfig.path;
    return {
      resourceMap: state.main.resourceMap,
      resourceFilter: state.main.resourceFilter,
      selectedPath: state.main.selectedPath,
      selectedResourceId: state.main.selectedResourceId,
      isInClusterMode: Boolean(
        state.main.previewResourceId && state.main.previewResourceId.endsWith(String(kubeConfigPath))
      ),
      isPreviewLoading: state.main.previewLoader.isLoading,
      isFolderLoading: state.ui.isFolderLoading,
    };
  },
  builder: {
    getRawItems: scope => {
      return Object.values(scope.resourceMap)
        .filter(resource => resource.name.startsWith('Patch:'))
        .sort((a, b) => {
          if (a.kind !== b.kind) {
            return a.kind.localeCompare(b.kind);
          }
          return a.name.localeCompare(b.name);
        });
    },
    isVisible: (_, rawItems) => {
      return rawItems.length > 0;
    },
    isLoading: scope => {
      return scope.isFolderLoading;
    },
    isInitialized: (_, rawItems) => {
      return rawItems.length > 0;
    },
  },
  itemBlueprint: {
    getName: rawItem => rawItem.name,
    getInstanceId: rawItem => rawItem.id,
    builder: {
      isSelected: rawItem => rawItem.isSelected,
      isHighlighted: rawItem => rawItem.isHighlighted,
      isDisabled: (_, scope) => Boolean(scope.isInClusterMode),
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        dispatch(selectK8sResource({resourceId: itemInstance.id}));
      },
    },
    customization: {
      prefix: {
        component: KustomizePatchPrefix,
      },
      suffix: {
        component: KustomizePatchSuffix,
      },
    },
  },
};

sectionBlueprintMap.register(KustomizePatchSectionBlueprint);

export default KustomizePatchSectionBlueprint;
