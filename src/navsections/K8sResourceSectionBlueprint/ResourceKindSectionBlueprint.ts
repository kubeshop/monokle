import navSectionNames from '@constants/navSectionNames';

import {
  checkMultipleResourceIds,
  checkResourceId,
  selectK8sResource,
  uncheckMultipleResourceIds,
  uncheckResourceId,
} from '@redux/reducers/main';
import {activeResourcesSelector} from '@redux/selectors';
import {isResourceHighlighted, isResourceSelected, isUnsavedResource} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {resourceMatchesKindHandler} from '@src/kindhandlers';

import {ResourceFilterType} from '@shared/models/appState';
import {K8sResource, ResourceIdentifier} from '@shared/models/k8sResource';
import {SectionBlueprint} from '@shared/models/navigator';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {RootState} from '@shared/models/rootState';
import {isInPreviewModeSelector} from '@shared/utils/selectors';

import ResourceKindContextMenu from './ResourceKindContextMenu';
import ResourceKindContextMenuWrapper from './ResourceKindContextMenuWrapper';
import {ResourceKindInformation} from './ResourceKindInformation';
import ResourceKindPrefix from './ResourceKindPrefix';
import ResourceKindSectionNameCounter from './ResourceKindSectionNameCounter';
import ResourceKindSectionNameSuffix from './ResourceKindSectionNameSuffix';
import ResourceKindSuffix from './ResourceKindSuffix';

export type ResourceKindScopeType = {
  activeResources: K8sResource[];
  resourceFilter: ResourceFilterType;
  selectedResourceId: string | undefined;
  selectedFilePath: string | undefined;
  checkedResourceIds: ResourceIdentifier[];
  state: RootState;
};

export function makeResourceKindNavSection(
  kindHandler: ResourceKindHandler
): SectionBlueprint<K8sResource, ResourceKindScopeType> {
  const kindSectionName = kindHandler.navigatorPath[2];
  const sectionBlueprint: SectionBlueprint<K8sResource, ResourceKindScopeType> = {
    name: kindSectionName,
    id: kindSectionName,
    containerElementId: 'navigator-sections-container',
    rootSectionId: navSectionNames.K8S_RESOURCES,
    getScope: state => {
      return {
        activeResources: activeResourcesSelector(state),
        resourceFilter: state.main.resourceFilter,
        selectedResourceId: state.main.selection?.type === 'resource' ? state.main.selection.resourceId : undefined,
        selectedFilePath: state.main.selection?.type === 'file' ? state.main.selection.filePath : undefined,
        checkedResourceIdentifiers: state.main.checkedResourceIdentifiers,
      };
    },
    builder: {
      getRawItems: scope => {
        return scope.activeResources
          .filter(r => resourceMatchesKindHandler(r, kindHandler))
          .sort((a, b) => {
            if (a.namespace && !b.namespace) {
              return -1;
            }
            if (!a.namespace && b.namespace) {
              return 1;
            }
            if (a.namespace && b.namespace && a.namespace !== b.namespace) {
              return a.namespace.localeCompare(b.namespace);
            }
            return a.name.localeCompare(b.name);
          });
      },
      getMeta: () => {
        return {resourceKind: kindHandler.kind};
      },
      isInitialized: scope => {
        return scope.activeResources.length > 0;
      },
      makeCheckable: scope => {
        return {
          checkedItemIds: scope.checkedResourceIds,
          checkItemsActionCreator: checkMultipleResourceIds,
          uncheckItemsActionCreator: uncheckMultipleResourceIds,
        };
      },
      shouldBeVisibleBeforeInitialized: true,
    },
    customization: {
      nameSuffix: {
        component: ResourceKindSectionNameSuffix,
        options: {
          isVisibleOnHover: true,
        },
      },
      nameCounter: {
        component: ResourceKindSectionNameCounter,
      },
      isCheckVisibleOnHover: true,
    },
    itemBlueprint: {
      getName: rawItem => rawItem.name,
      getInstanceId: rawItem => rawItem.id,
      builder: {
        isSelected: (rawItem, scope) => isResourceSelected(rawItem, scope.selection),
        isHighlighted: (rawItem, scope) => isResourceHighlighted(rawItem, scope.highlights),
        isDirty: rawItem => isUnsavedResource(rawItem),
        isVisible: (rawItem, scope) => {
          const isPassingFilter = isResourcePassingFilter(rawItem, scope.resourceFilter);

          return isPassingFilter;
        },
        isCheckable: () => true,
        isChecked: (itemInstance, scope) => {
          return scope.checkedResourceIds.includes(itemInstance.id);
        },
      },
      instanceHandler: {
        onClick: (itemInstance, dispatch) => {
          dispatch(selectK8sResource({resourceId: itemInstance.id}));
        },
        onCheck: (itemIstance, dispatch) => {
          if (itemIstance.isChecked) {
            dispatch(uncheckResourceId(itemIstance.id));
          } else {
            dispatch(checkResourceId(itemIstance.id));
          }
        },
      },
      customization: {
        prefix: {component: ResourceKindPrefix},
        suffix: {component: ResourceKindSuffix},
        contextMenuWrapper: {component: ResourceKindContextMenuWrapper},
        contextMenu: {component: ResourceKindContextMenu, options: {isVisibleOnHover: true}},
        isCheckVisibleOnHover: true,
        information: {component: ResourceKindInformation, options: {isVisibleOnHover: true}},
      },
    },
  };
  return sectionBlueprint;
}
