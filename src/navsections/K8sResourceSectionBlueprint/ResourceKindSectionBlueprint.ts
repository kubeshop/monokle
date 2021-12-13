import {CLUSTER_DIFF_PREFIX, PREVIEW_PREFIX} from '@constants/constants';
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
import {isUnsavedResource} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import ResourceKindContextMenu from './ResourceKindContextMenu';
import ResourceKindPrefix from './ResourceKindPrefix';
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
    rootSectionId: navSectionNames.K8S_RESOURCES,
    getScope: state => {
      return {
        activeResources: Object.values(state.main.resourceMap).filter(
          r =>
            ((state.main.previewResourceId === undefined && state.main.previewValuesFileId === undefined) ||
              r.filePath.startsWith(PREVIEW_PREFIX)) &&
            !r.filePath.startsWith(CLUSTER_DIFF_PREFIX) &&
            !r.name.startsWith('Patch:')
        ),
        resourceFilter: state.main.resourceFilter,
        selectedResourceId: state.main.selectedResourceId,
        selectedPath: state.main.selectedPath,
        checkedResourceIds: state.main.checkedResourceIds,
      };
    },
    builder: {
      getRawItems: scope => {
        return scope.activeResources
          .filter(r => r.kind === kindHandler.kind)
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      getMeta: () => {
        return {resourceKind: kindHandler.kind};
      },
      isInitialized: scope => {
        return scope.activeResources.length > 0;
      },
      isCheckable: () => true,
      isChecked: (_, __, itemInstances) => {
        if (!itemInstances) {
          return false;
        }
        let nrOfCheckedItems = 0;
        let nrOfVisilbeItems = 0;
        itemInstances.forEach(itemInstance => {
          if (itemInstance.isChecked) {
            nrOfCheckedItems += 1;
          }
          if (itemInstance.isVisible) {
            nrOfVisilbeItems += 1;
          }
        });
        if (nrOfCheckedItems === 0) {
          return false;
        }
        if (nrOfCheckedItems < nrOfVisilbeItems) {
          return 'partial';
        }
        if (nrOfCheckedItems === nrOfVisilbeItems) {
          return true;
        }
        return true;
      },
      shouldBeVisibleBeforeInitialized: true,
    },
    instanceHandler: {
      onCheck: (sectionInstance, dispatch, itemInstances) => {
        if (!itemInstances) {
          return;
        }
        const visibleItemIds = itemInstances.filter(i => i.isVisible).map(i => i.id);
        if (!sectionInstance.isChecked || sectionInstance.isChecked === 'partial') {
          dispatch(checkMultipleResourceIds(visibleItemIds));
          return;
        }
        dispatch(uncheckMultipleResourceIds(visibleItemIds));
      },
    },
    customization: {
      nameSuffix: {
        component: ResourceKindSectionNameSuffix,
        options: {
          isVisibleOnHover: true,
        },
      },
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
        contextMenu: {component: ResourceKindContextMenu, options: {isVisibleOnHover: true}},
        isCheckVisibleOnHover: true,
      },
    },
  };
  return sectionBlueprint;
}
