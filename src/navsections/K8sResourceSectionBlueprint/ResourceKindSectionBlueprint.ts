import navSectionNames from '@constants/navSectionNames';

import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {
  checkMultipleResourceIds,
  checkResourceId,
  selectK8sResource,
  uncheckMultipleResourceIds,
  uncheckResourceId,
} from '@redux/reducers/main';
import {activeResourcesSelector} from '@redux/selectors';
import {isUnsavedResource} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {resourceMatchesKindHandler} from '@src/kindhandlers';

import ResourceKindContextMenu from './ResourceKindContextMenu';
import ResourceKindContextMenuWrapper from './ResourceKindContextMenuWrapper';
import ResourceKindPrefix from './ResourceKindPrefix';
import ResourceKindSectionNameCounter from './ResourceKindSectionNameCounter';
import ResourceKindSectionNameSuffix from './ResourceKindSectionNameSuffix';
import ResourceKindSuffix from './ResourceKindSuffix';

export type ResourceKindScopeType = {
  activeResources: K8sResource[];
  resourceFilter: ResourceFilterType;
  selectedResourceId: string | undefined;
  selectedPath: string | undefined;
  checkedResourceIds: string[];
};

export function makeResourceKindNavSection(
  kindHandler: ResourceKindHandler
): SectionBlueprint<K8sResource, ResourceKindScopeType> {
  const kindSectionName = kindHandler.navigatorPath[2];
  const sectionBlueprint: SectionBlueprint<K8sResource, ResourceKindScopeType> = {
    name: kindSectionName,
    id: kindSectionName,
    containerElementId: 'navigator-sections-container',
    rowHeight: 26,
    rowFontSize: 16,
    rootSectionId: navSectionNames.K8S_RESOURCES,
    getScope: state => {
      return {
        activeResources: activeResourcesSelector(state),
        resourceFilter: state.main.resourceFilter,
        selectedResourceId: state.main.selectedResourceId,
        selectedPath: state.main.selectedPath,
        checkedResourceIds: state.main.checkedResourceIds,
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
        isSelected: rawItem => rawItem.isSelected,
        isHighlighted: rawItem => rawItem.isHighlighted,
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
      },
    },
  };
  return sectionBlueprint;
}
