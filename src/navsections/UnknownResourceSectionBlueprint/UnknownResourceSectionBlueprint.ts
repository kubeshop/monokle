import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';

import {selectK8sResource} from '@redux/reducers/main';
import {unknownResourcesSelector} from '@redux/selectors';
import {isUnsavedResource} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import ResourceKindContextMenu from '../K8sResourceSectionBlueprint/ResourceKindContextMenu';
import ResourceKindContextMenuWrapper from '../K8sResourceSectionBlueprint/ResourceKindContextMenuWrapper';
import ResourceKindPrefix from '../K8sResourceSectionBlueprint/ResourceKindPrefix';
import ResourceKindSuffix from '../K8sResourceSectionBlueprint/ResourceKindSuffix';
import sectionBlueprintMap from '../sectionBlueprintMap';

export type UnknownResourceScopeType = {
  unknownResources: K8sResource[];
  resourceFilter: ResourceFilterType;
  isPreviewLoading: boolean;
  isFolderLoading: boolean;
};

export const UNKNOWN_RESOURCE_SECTION_NAME = 'Unknown Resources' as const;

const UnknownResourceSectionBlueprint: SectionBlueprint<K8sResource, UnknownResourceScopeType> = {
  name: UNKNOWN_RESOURCE_SECTION_NAME,
  id: UNKNOWN_RESOURCE_SECTION_NAME,
  rootSectionId: UNKNOWN_RESOURCE_SECTION_NAME,
  getScope: state => {
    return {
      unknownResources: unknownResourcesSelector(state),
      resourceFilter: state.main.resourceFilter,
      isPreviewLoading: state.main.previewLoader.isLoading,
      isFolderLoading: state.ui.isFolderLoading,
    };
  },
  builder: {
    // TODO: subsections with the unknown kinds should be created
    getRawItems: scope =>
      scope.unknownResources.sort((a, b) => {
        if (a.kind !== b.kind) {
          return a.kind.localeCompare(b.kind);
        }
        return a.name.localeCompare(b.name);
      }),
    isVisible: (_, rawItems) => {
      return rawItems.length > 0;
    },
    isLoading: scope => {
      return scope.isPreviewLoading || scope.isFolderLoading;
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
      isDirty: rawItem => isUnsavedResource(rawItem),
      isVisible: (rawItem, scope) => isResourcePassingFilter(rawItem, scope.resourceFilter),
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        dispatch(selectK8sResource({resourceId: itemInstance.id}));
      },
    },
    customization: {
      contextMenuWrapper: {component: ResourceKindContextMenuWrapper},
      contextMenu: {component: ResourceKindContextMenu, options: {isVisibleOnHover: true}},
      prefix: {component: ResourceKindPrefix},
      suffix: {component: ResourceKindSuffix},
    },
  },
};

sectionBlueprintMap.register(UnknownResourceSectionBlueprint);

export default UnknownResourceSectionBlueprint;
