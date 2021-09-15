import {NavSection} from '@models/navsection';
import navSectionNames from '@constants/navSectionNames';
import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandlers} from '@src/kindhandlers';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {ResourceFilterType, ResourceMapType} from '@models/appstate';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {AppDispatch} from '@redux/store';
import {selectK8sResource} from '@redux/reducers/main';
import {isPassingKeyValueFilter} from '@utils/filter';

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

const subsectionNames = navSectionNames.representation[navSectionNames.K8S_RESOURCES];

const kindHandlersBySubsectionName: Record<string, ResourceKindHandler[]> = {};
ResourceKindHandlers.forEach(kindHandler => {
  const navSectionName = kindHandler.navigatorPath[0];
  if (navSectionName !== navSectionNames.K8S_RESOURCES) {
    return;
  }
  const subsectionName = kindHandler.navigatorPath[1];
  if (kindHandlersBySubsectionName[subsectionName]) {
    kindHandlersBySubsectionName[subsectionName].push(kindHandler);
  } else {
    kindHandlersBySubsectionName[subsectionName] = [kindHandler];
  }
});

type ResourceKindNavSectionScope = {
  resourceMap: ResourceMapType;
  resourceFilter: ResourceFilterType;
  dispatch: AppDispatch;
};

function makeResourceKindNavSection(
  kindHandler: ResourceKindHandler
): NavSection<K8sResource, ResourceKindNavSectionScope> {
  const kindSectionName = kindHandler.navigatorPath[2];
  const navSection: NavSection<K8sResource, ResourceKindNavSectionScope> = {
    name: kindSectionName,
    useScope: () => {
      const dispatch = useAppDispatch();
      const resourceMap = useAppSelector(state => state.main.resourceMap);
      const resourceFilter = useAppSelector(state => state.main.resourceFilter);
      return {resourceMap, resourceFilter, dispatch};
    },
    getItems: scope => {
      return Object.values(scope.resourceMap).filter(r => r.kind === kindHandler.kind);
    },
    itemHandler: {
      getName: item => item.name,
      getIdentifier: item => item.id,
      isSelected: item => item.isSelected,
      isHighlighted: item => item.isHighlighted,
      onClick: (item, scope) => {
        scope.dispatch(selectK8sResource({resourceId: item.id}));
      },
      isVisible: (item, scope) => {
        const isPassingFilter = isResourcePassingFilter(item, scope.resourceFilter);
        return isPassingFilter;
      },
    },
  };
  return navSection;
}

export type K8sResourceNavSectionScope = ResourceKindNavSectionScope | void;
export const K8sResourceNavSection: NavSection<K8sResource, K8sResourceNavSectionScope> = {
  name: navSectionNames.K8S_RESOURCES,
  useScope: () => {},
  subsections: subsectionNames.map(subsectionName => {
    return {
      name: subsectionName,
      useScope: () => {},
      subsections: (kindHandlersBySubsectionName[subsectionName] || []).map(kindHandler =>
        makeResourceKindNavSection(kindHandler)
      ),
    };
  }),
};
