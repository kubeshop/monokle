import {selectResource} from '@redux/reducers/main';
import {unknownResourcesSelector} from '@redux/selectors/resourceMapSelectors';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {ResourceFilterType} from '@shared/models/appState';
import {K8sResource} from '@shared/models/k8sResource';
import {SectionBlueprint} from '@shared/models/navigator';
import {AppSelection} from '@shared/models/selection';

import ResourceKindContextMenu from '../K8sResourceSectionBlueprint/ResourceKindContextMenu';
import ResourceKindContextMenuWrapper from '../K8sResourceSectionBlueprint/ResourceKindContextMenuWrapper';
import {ResourceKindInformation} from '../K8sResourceSectionBlueprint/ResourceKindInformation';
import ResourceKindPrefix from '../K8sResourceSectionBlueprint/ResourceKindPrefix';
import ResourceKindSuffix from '../K8sResourceSectionBlueprint/ResourceKindSuffix';
import sectionBlueprintMap from '../sectionBlueprintMap';

export type UnknownResourceScopeType = {
  unknownResources: K8sResource[];
  resourceFilter: ResourceFilterType;
  isPreviewLoading: boolean;
  isFolderLoading: boolean;
  selection?: AppSelection;
  highlights?: AppSelection[];
};

export const UNKNOWN_RESOURCE_SECTION_NAME = 'Unknown Resources' as const;

const UnknownResourceSectionBlueprint: SectionBlueprint<K8sResource, UnknownResourceScopeType> = {
  name: UNKNOWN_RESOURCE_SECTION_NAME,
  id: UNKNOWN_RESOURCE_SECTION_NAME,
  containerElementId: 'navigator-sections-container',
  rootSectionId: UNKNOWN_RESOURCE_SECTION_NAME,
  getScope: state => {
    return {
      unknownResources: unknownResourcesSelector(state),
      resourceFilter: state.main.resourceFilter,
      isPreviewLoading: Boolean(state.main.previewOptions.isLoading),
      isFolderLoading: state.ui.isFolderLoading,
      selection: state.main.selection,
      highlights: state.main.highlights,
    };
  },
  builder: {
    getRawItems: scope => scope.unknownResources,
    getGroups: scope => {
      const unknownResourcesByKind: Record<string, K8sResource[]> = scope.unknownResources.reduce<
        Record<string, K8sResource[]>
      >((acc, resource) => {
        if (acc[resource.kind]) {
          acc[resource.kind].push(resource);
        } else {
          acc[resource.kind] = [resource];
        }
        return acc;
      }, {});
      return Object.entries(unknownResourcesByKind)
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
      isSelected: (rawItem, scope) => isResourceSelected(rawItem, scope.selection),
      isHighlighted: (rawItem, scope) => isResourceHighlighted(rawItem, scope.highlights),
      isDirty: rawItem => rawItem.storage === 'transient',
      isVisible: (rawItem, scope) => isResourcePassingFilter(rawItem, scope.resourceFilter),
      getMeta: rawItem => {
        return {
          resourceStorage: rawItem.storage,
        };
      },
    },
    instanceHandler: {
      onClick: (itemInstance, dispatch) => {
        const resourceStorage = itemInstance.meta?.resourceStorage;
        if (!resourceStorage) {
          return;
        }
        dispatch(selectResource({resourceIdentifier: {id: itemInstance.id, storage: resourceStorage}}));
      },
    },
    customization: {
      contextMenuWrapper: {component: ResourceKindContextMenuWrapper},
      contextMenu: {component: ResourceKindContextMenu, options: {isVisibleOnHover: true}},
      prefix: {component: ResourceKindPrefix},
      suffix: {component: ResourceKindSuffix},
      information: {component: ResourceKindInformation, options: {isVisibleOnHover: true}},
    },
  },
};

sectionBlueprintMap.register(UnknownResourceSectionBlueprint);

export default UnknownResourceSectionBlueprint;
