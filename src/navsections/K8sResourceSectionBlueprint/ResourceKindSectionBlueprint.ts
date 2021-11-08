import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {ResourceFilterType} from '@models/appstate';
import {selectK8sResource} from '@redux/reducers/main';
import {isUnsavedResource} from '@redux/services/resource';
import {SectionBlueprint} from '@models/navigator';
import {CLUSTER_DIFF_PREFIX, PREVIEW_PREFIX} from '@constants/constants';
import {isResourcePassingFilter} from '@utils/resources';
import ResourceKindContextMenu from './ResourceKindContextMenu';
import ResourceKindPrefix from './ResourceKindPrefix';
import ResourceKindSuffix from './ResourceKindSuffix';
import ResourceKindNameDisplay from './ResourceKindNameDisplay';

export type ResourceKindScopeType = {
  activeResources: K8sResource[];
  resourceFilter: ResourceFilterType;
  selectedResourceId: string | undefined;
  selectedPath: string | undefined;
};

export function makeResourceKindNavSection(
  kindHandler: ResourceKindHandler
): SectionBlueprint<K8sResource, ResourceKindScopeType> {
  const kindSectionName = kindHandler.navigatorPath[2];
  const sectionBlueprint: SectionBlueprint<K8sResource, ResourceKindScopeType> = {
    name: kindSectionName,
    id: kindSectionName,
    getScope: state => {
      return {
        activeResources: Object.values(state.main.resourceMap).filter(
          r =>
            ((state.main.previewResourceId === undefined && state.main.previewValuesFileId === undefined) ||
              r.filePath.startsWith(PREVIEW_PREFIX)) &&
            !r.filePath.startsWith(CLUSTER_DIFF_PREFIX)
        ),
        resourceFilter: state.main.resourceFilter,
        selectedResourceId: state.main.selectedResourceId,
        selectedPath: state.main.selectedPath,
      };
    },
    builder: {
      getRawItems: scope => {
        return scope.activeResources
          .filter(r => r.kind === kindHandler.kind)
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      isInitialized: scope => {
        return scope.activeResources.length > 0;
      },
      shouldBeVisibleBeforeInitialized: true,
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
        shouldScrollIntoView: (rawItem, scope) => {
          if (rawItem.isHighlighted && scope.selectedPath) {
            return true;
          }
          if (rawItem.isSelected && scope.selectedResourceId) {
            return true;
          }
          return false;
        },
      },
      instanceHandler: {
        onClick: (itemInstance, dispatch) => {
          dispatch(selectK8sResource({resourceId: itemInstance.id}));
        },
      },
      customization: {
        prefix: {component: ResourceKindPrefix},
        suffix: {component: ResourceKindSuffix},
        contextMenu: {component: ResourceKindContextMenu, options: {isVisibleOnHover: true}},
        nameDisplay: {
          component: ResourceKindNameDisplay,
        },
      },
    },
  };
  return sectionBlueprint;
}
