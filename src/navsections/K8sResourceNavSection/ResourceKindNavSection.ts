import {useSelector} from 'react-redux';
import {NavSection} from '@models/navsection';
import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {ResourceFilterType} from '@models/appstate';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {AppDispatch} from '@redux/store';
import {selectK8sResource} from '@redux/reducers/main';
import {isPassingKeyValueFilter} from '@utils/filter';
import {activeResourcesSelector} from '@redux/selectors';
import {isUnsavedResource} from '@redux/services/resource';
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

export type ResourceKindNavSectionScope = {
  activeResources: K8sResource[];
  resourceFilter: ResourceFilterType;
  selectedResourceId: string | undefined;
  selectedPath: string | undefined;
  dispatch: AppDispatch;
};

export function makeResourceKindNavSection(
  kindHandler: ResourceKindHandler
): NavSection<K8sResource, ResourceKindNavSectionScope> {
  const kindSectionName = kindHandler.navigatorPath[2];
  const navSection: NavSection<K8sResource, ResourceKindNavSectionScope> = {
    name: kindSectionName,
    useScope: () => {
      const dispatch = useAppDispatch();
      const resourceFilter = useAppSelector(state => state.main.resourceFilter);
      const activeResources = useSelector(activeResourcesSelector);
      const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
      const selectedPath = useAppSelector(state => state.main.selectedPath);
      return {activeResources, resourceFilter, selectedResourceId, selectedPath, dispatch};
    },
    getItems: scope => {
      return scope.activeResources.filter(r => r.kind === kindHandler.kind);
    },
    itemHandler: {
      getName: item => item.name,
      getIdentifier: item => item.id,
      isSelected: item => item.isSelected,
      isHighlighted: item => item.isHighlighted,
      isDirty: item => isUnsavedResource(item),
      onClick: (item, scope) => {
        scope.dispatch(selectK8sResource({resourceId: item.id}));
      },
      isVisible: (item, scope) => {
        const isPassingFilter = isResourcePassingFilter(item, scope.resourceFilter);
        return isPassingFilter;
      },
      shouldScrollIntoView: (item, scope) => {
        if (item.isHighlighted && scope.selectedPath) {
          return true;
        }
        if (item.isSelected && scope.selectedResourceId) {
          return true;
        }
        return false;
      },
    },
    itemCustomization: {
      Prefix: ResourceKindPrefix,
      Suffix: ResourceKindSuffix,
      ContextMenu: ResourceKindContextMenu,
    },
  };
  return navSection;
}
