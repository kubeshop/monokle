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
  isInPreviewMode: boolean;
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
    return {
      resourceMap: state.main.resourceMap,
      resourceFilter: state.main.resourceFilter,
      selectedPath: state.main.selectedPath,
      selectedResourceId: state.main.selectedResourceId,
      isInPreviewMode: Boolean(state.main.previewResourceId) || Boolean(state.main.previewValuesFileId),
      isPreviewLoading: state.main.previewLoader.isLoading,
      isFolderLoading: state.ui.isFolderLoading,
    };
  },
  builder: {
    getRawItems: scope => {
      return Object.values(scope.resourceMap).filter(resource => resource.name.startsWith('Patch:'));
    },
    getGroups: scope => {
      const patchResources = Object.values(scope.resourceMap).filter(resource => resource.name.startsWith('Patch:'));
      const patcheResourcesByKind: Record<string, K8sResource[]> = patchResources.reduce<Record<string, K8sResource[]>>(
        (acc, resource) => {
          if (acc[resource.kind]) {
            acc[resource.kind]!.push(resource);
          } else {
            acc[resource.kind] = [resource];
          }
          return acc;
        },
        {}
      );
      return Object.entries(patcheResourcesByKind)
        .map(([resourceKind, resources]) => {
          return {
            id: resourceKind,
            name: resourceKind,
            itemIds: resources.map(r => r.id),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
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
