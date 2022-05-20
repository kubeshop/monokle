import {ROOT_FILE_ENTRY} from '@constants/constants';
import navSectionNames from '@constants/navSectionNames';

import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {checkMultipleResourceIds, uncheckMultipleResourceIds} from '@redux/reducers/main';
import {activeResourcesSelector} from '@redux/selectors';

import {isResourcePassingFilter} from '@utils/resources';

import {KindHandlersEventEmitter, ResourceKindHandlers} from '@src/kindhandlers';
import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import K8sResourceSectionEmptyDisplay from './K8sResourceSectionEmptyDisplay';
import K8sResourceSectionNameSuffix from './K8sResourceSectionNameSuffix';
import {makeResourceKindNavSection} from './ResourceKindSectionBlueprint';

const childSectionNames = navSectionNames.representation[navSectionNames.K8S_RESOURCES];

const kindHandlersBySubsectionName: Record<string, ResourceKindHandler[]> = {};
ResourceKindHandlers.forEach(kindHandler => {
  const navSectionName = kindHandler.navigatorPath[0];
  if (navSectionName !== navSectionNames.K8S_RESOURCES) {
    return;
  }
  const subsectionName = kindHandler.navigatorPath[1];
  if (!childSectionNames.includes(subsectionName)) {
    childSectionNames.push(subsectionName);
  }

  if (kindHandlersBySubsectionName[subsectionName]) {
    kindHandlersBySubsectionName[subsectionName].push(kindHandler);
  } else {
    kindHandlersBySubsectionName[subsectionName] = [kindHandler];
  }
});

const makeSubsection = (subsectionName: string, childSectionIds?: string[]) => {
  const subsection: SectionBlueprint<K8sResource, {activeResourcesLength: number; checkedResourceIds: string[]}> = {
    name: subsectionName,
    id: subsectionName,
    containerElementId: 'navigator-sections-container',
    rowHeight: 32,
    rowFontSize: 20,
    childSectionIds,
    rootSectionId: navSectionNames.K8S_RESOURCES,
    getScope: state => {
      const activeResources = activeResourcesSelector(state);
      return {activeResourcesLength: activeResources.length, checkedResourceIds: state.main.checkedResourceIds};
    },
    builder: {
      isInitialized: scope => {
        return scope.activeResourcesLength > 0;
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
      isCheckVisibleOnHover: true,
    },
  };
  return subsection;
};

const childSections = childSectionNames.map(childSectionName => {
  const kindHandlerSections = (kindHandlersBySubsectionName[childSectionName] || []).map(kindHandler =>
    makeResourceKindNavSection(kindHandler)
  );

  kindHandlerSections.forEach(k => sectionBlueprintMap.register(k));

  const subsection = makeSubsection(
    childSectionName,
    kindHandlerSections.map(k => k.name)
  );
  return subsection;
});

childSections.forEach(s => sectionBlueprintMap.register(s));

export type K8sResourceScopeType = {
  isFolderLoading: boolean;
  isFolderOpen: boolean;
  isPreviewLoading: boolean;
  activeResources: K8sResource[];
  resourceFilter: ResourceFilterType;
  checkedResourceIds: string[];
};

export const K8S_RESOURCE_SECTION_NAME = navSectionNames.K8S_RESOURCES;

const K8sResourceSectionBlueprint: SectionBlueprint<K8sResource, K8sResourceScopeType> = {
  name: navSectionNames.K8S_RESOURCES,
  id: navSectionNames.K8S_RESOURCES,
  containerElementId: 'navigator-sections-container',
  rowHeight: 38,
  rowFontSize: 24,
  rootSectionId: navSectionNames.K8S_RESOURCES,
  childSectionIds: childSectionNames,
  getScope: state => {
    return {
      isFolderLoading: state.ui.isFolderLoading,
      isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      isPreviewLoading: state.main.previewLoader.isLoading,
      activeResources: activeResourcesSelector(state),
      resourceFilter: state.main.resourceFilter,
      checkedResourceIds: state.main.checkedResourceIds,
    };
  },
  builder: {
    isLoading: scope => {
      return scope.isFolderLoading || scope.isPreviewLoading;
    },
    isInitialized: scope => {
      return scope.activeResources.length > 0;
    },
    isEmpty: scope => {
      return (
        scope.isFolderOpen &&
        (scope.activeResources.length === 0 ||
          scope.activeResources.every(resource => !isResourcePassingFilter(resource, scope.resourceFilter)))
      );
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
    emptyDisplay: {
      component: K8sResourceSectionEmptyDisplay,
    },
    nameContext: {
      component: K8sResourceSectionNameSuffix,
    },
    isCheckVisibleOnHover: true,
  },
};

sectionBlueprintMap.register(K8sResourceSectionBlueprint);

KindHandlersEventEmitter.on('register', kindHandler => {
  const [rootSectionId, parentSectionId, kindSectionId] = kindHandler.navigatorPath;
  if (rootSectionId !== navSectionNames.K8S_RESOURCES) {
    return;
  }
  const rootSection = K8sResourceSectionBlueprint;

  let parentSection = rootSection.childSectionIds
    ?.map(id => sectionBlueprintMap.getById(id))
    .filter((s): s is SectionBlueprint<any, any> => s !== undefined)
    .find(s => s.id === parentSectionId);

  if (!parentSection) {
    parentSection = makeSubsection(parentSectionId, [kindSectionId]);
    sectionBlueprintMap.register(parentSection);
    if (rootSection.childSectionIds) {
      rootSection.childSectionIds.push(parentSection.id);
    } else {
      rootSection.childSectionIds = [parentSection.id];
    }
  } else {
    parentSection.childSectionIds = parentSection.childSectionIds?.length
      ? parentSection.childSectionIds.includes(kindSectionId)
        ? parentSection.childSectionIds
        : [...parentSection.childSectionIds, kindSectionId]
      : [kindSectionId];
  }

  let kindSection = parentSection.childSectionIds
    ?.map(id => sectionBlueprintMap.getById(id))
    .filter((s): s is SectionBlueprint<any, any> => s !== undefined)
    .find(s => s.id === kindSectionId);

  if (!kindSection) {
    kindSection = makeResourceKindNavSection(kindHandler);
    sectionBlueprintMap.register(kindSection);
  }
});

export default K8sResourceSectionBlueprint;
