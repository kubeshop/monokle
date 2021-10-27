import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {ResourceFilterType} from '@models/appstate';
import {selectK8sResource} from '@redux/reducers/main';
import {isPassingKeyValueFilter} from '@utils/filter';
import {isUnsavedResource} from '@redux/services/resource';
import {SectionBlueprint} from '@models/navigator';
import {PREVIEW_PREFIX} from '@constants/constants';
import ResourceKindContextMenu from './ResourceKindContextMenu';
import ResourceKindPrefix from './ResourceKindPrefix';
import ResourceKindSuffix from './ResourceKindSuffix';

function isResourcePassingFilter(resource: K8sResource, filters: ResourceFilterType) {
  if (
    filters.name &&
    filters.name.trim() !== '' &&
    resource.name.toLowerCase().indexOf(filters.name.toLowerCase()) === -1
  ) {
    return false;
  }
  if (filters.kind && resource.kind !== filters.kind) {
    return false;
  }
  if (filters.namespace) {
    if (!resource.namespace && filters.namespace !== 'default') {
      return false;
    }
    return resource.namespace === filters.namespace;
  }
  if (filters.labels && Object.keys(filters.labels).length > 0) {
    const resourceLabels = resource.content?.metadata?.labels;
    if (!resourceLabels) {
      return false;
    }
    const isPassingLabelFilter = isPassingKeyValueFilter(resourceLabels, filters.labels);
    if (!isPassingLabelFilter) {
      return false;
    }
  }
  if (filters.annotations && Object.keys(filters.annotations).length > 0) {
    const resourceAnnotations = resource.content?.metadata?.annotations;
    if (!resourceAnnotations) {
      return false;
    }
    const isPassingAnnotationsFilter = isPassingKeyValueFilter(resourceAnnotations, filters.annotations);
    if (!isPassingAnnotationsFilter) {
      return false;
    }
  }
  return true;
}

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
            (state.main.previewResourceId === undefined && state.main.previewValuesFileId === undefined) ||
            r.filePath.startsWith(PREVIEW_PREFIX)
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
        contextMenu: {component: ResourceKindContextMenu},
      },
    },
  };
  return sectionBlueprint;
}
