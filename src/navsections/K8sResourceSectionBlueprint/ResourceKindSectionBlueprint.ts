import {isEmpty} from 'lodash';

import navSectionNames from '@constants/navSectionNames';

import {selectResource} from '@redux/reducers/main';
import {activeResourceMetaMapSelector} from '@redux/selectors';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {resourceMatchesKindHandler} from '@src/kindhandlers';

import {ResourceFilterType} from '@shared/models/appState';
import {ResourceIdentifier, ResourceMeta, ResourceMetaMap, isTransientResource} from '@shared/models/k8sResource';
import {SectionBlueprint} from '@shared/models/navigator';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {AppSelection} from '@shared/models/selection';

import ResourceKindContextMenu from './ResourceKindContextMenu';
import ResourceKindContextMenuWrapper from './ResourceKindContextMenuWrapper';
import {ResourceKindInformation} from './ResourceKindInformation';
import ResourceKindPrefix from './ResourceKindPrefix';
import ResourceKindSectionNameCounter from './ResourceKindSectionNameCounter';
import ResourceKindSectionNameSuffix from './ResourceKindSectionNameSuffix';
import ResourceKindSuffix from './ResourceKindSuffix';

export type ResourceKindScopeType = {
  activeResourceMetaMap: ResourceMetaMap;
  resourceFilter: ResourceFilterType;
  selection: AppSelection | undefined;
  highlights: AppSelection[] | undefined;
  checkedResourceIdentifiers: ResourceIdentifier[];
};

export function makeResourceKindNavSection(
  kindHandler: ResourceKindHandler
): SectionBlueprint<ResourceMeta, ResourceKindScopeType> {
  const kindSectionName = kindHandler.navigatorPath[2];
  const sectionBlueprint: SectionBlueprint<ResourceMeta, ResourceKindScopeType> = {
    name: kindSectionName,
    id: kindSectionName,
    containerElementId: 'navigator-sections-container',
    rootSectionId: navSectionNames.K8S_RESOURCES,
    getScope: state => {
      return {
        activeResourceMetaMap: activeResourceMetaMapSelector(state),
        resourceFilter: state.main.resourceFilter,
        selection: state.main.selection,
        highlights: state.main.highlights,
        checkedResourceIdentifiers: state.main.checkedResourceIdentifiers,
      };
    },
    builder: {
      getRawItems: scope => {
        return Object.values(scope.activeResourceMetaMap)
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
        return isEmpty(scope.activeResourceMetaMap);
      },
      // TODO: reimplement checkable
      // makeCheckable: scope => {
      //   return {
      //     checkedItemIds: scope.checkedResourceIdentifiers.map(r => r.id),
      //     checkItemsActionCreator: checkMultipleResourceIds,
      //     uncheckItemsActionCreator: uncheckMultipleResourceIds,
      //   };
      // },
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
        isDirty: rawItem => isTransientResource(rawItem),
        isVisible: (rawItem, scope) => {
          const isPassingFilter = isResourcePassingFilter(rawItem, scope.resourceFilter);

          return isPassingFilter;
        },
        isCheckable: () => true,
        // isChecked: (itemInstance, scope) => {
        //   return scope.checkedResourceIds.includes(itemInstance.id);
        // },
        getMeta: rawItem => {
          return {
            resourceStorage: rawItem.origin.storage,
          };
        },
      },
      instanceHandler: {
        onClick: (itemInstance, dispatch) => {
          dispatch(selectResource({resourceId: itemInstance.id, resourceStorage: itemInstance.meta?.resourceStorage}));
        },
        // onCheck: (itemIstance, dispatch) => {
        //   if (itemIstance.isChecked) {
        //     dispatch(uncheckResourceId(itemIstance.id));
        //   } else {
        //     dispatch(checkResourceId(itemIstance.id));
        //   }
        // },
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
