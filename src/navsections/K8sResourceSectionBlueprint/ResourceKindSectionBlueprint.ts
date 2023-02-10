import navSectionNames from '@constants/navSectionNames';

import {selectResource} from '@redux/reducers/main';
import {activeResourceMetaMapSelector, transientResourceMetaMapSelector} from '@redux/selectors/resourceMapSelectors';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {resourceMatchesKindHandler} from '@src/kindhandlers';

import {ResourceFilterType} from '@shared/models/appState';
import {ResourceIdentifier, ResourceMeta} from '@shared/models/k8sResource';
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
  resourceFilter: ResourceFilterType;
  selection: AppSelection | undefined;
  highlights: AppSelection[] | undefined;
  checkedResourceIdentifiers: ResourceIdentifier[];
  [filteredResources: string]: ResourceMeta[] | unknown; // TODO: @monokle/tree-navigator will fix this workaround
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
      const activeResourceMetaMap = activeResourceMetaMapSelector(state);
      const transientResourceMetaMap = transientResourceMetaMapSelector(state);
      const newFilteredResources = [
        ...Object.values(activeResourceMetaMap),
        ...Object.values(transientResourceMetaMap),
      ].filter(r => resourceMatchesKindHandler(r, kindHandler));
      return {
        resourceFilter: state.main.resourceFilter,
        selection: state.main.selection,
        highlights: state.main.highlights,
        checkedResourceIdentifiers: state.main.checkedResourceIdentifiers,
        [`${kindSectionName}-filteredResources`]: newFilteredResources,
      };
    },
    builder: {
      getRawItems: scope => {
        const filteredResources = scope[`${kindSectionName}-filteredResources`] as ResourceMeta[];
        return filteredResources.sort((a, b) => {
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
        isDirty: rawItem => rawItem.storage === 'transient',
        isVisible: (rawItem, scope) => {
          const isPassingFilter = isResourcePassingFilter(rawItem, scope.resourceFilter);
          return isPassingFilter;
        },
        // isCheckable: () => true,
        // isChecked: (itemInstance, scope) => {
        //   return scope.checkedResourceIds.includes(itemInstance.id);
        // },
        getMeta: rawItem => {
          return {
            resourceStorage: rawItem.storage,
          };
        },
      },
      instanceHandler: {
        onClick: (itemInstance, dispatch) => {
          dispatch(
            selectResource({resourceIdentifier: {id: itemInstance.id, storage: itemInstance.meta?.resourceStorage}})
          );
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
