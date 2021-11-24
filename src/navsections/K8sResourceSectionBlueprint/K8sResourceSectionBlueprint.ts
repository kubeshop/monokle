import {PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';
import navSectionNames from '@constants/navSectionNames';

import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {SectionBlueprint} from '@models/navigator';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {isResourcePassingFilter} from '@utils/resources';

import {ResourceKindHandlers} from '@src/kindhandlers';
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
  if (kindHandlersBySubsectionName[subsectionName]) {
    kindHandlersBySubsectionName[subsectionName].push(kindHandler);
  } else {
    kindHandlersBySubsectionName[subsectionName] = [kindHandler];
  }
});

const childSections = childSectionNames.map(childSectionName => {
  const kindHandlerSections = (kindHandlersBySubsectionName[childSectionName] || []).map(kindHandler =>
    makeResourceKindNavSection(kindHandler)
  );

  kindHandlerSections.forEach(k => sectionBlueprintMap.register(k));

  const subsection: SectionBlueprint<K8sResource, {activeResourcesLength: number}> = {
    name: childSectionName,
    id: childSectionName,
    rootSectionId: navSectionNames.K8S_RESOURCES,
    childSectionIds: kindHandlerSections.map(k => k.name),
    getScope: state => {
      const activeResources = Object.values(state.main.resourceMap).filter(
        r =>
          (state.main.previewResourceId === undefined && state.main.previewValuesFileId === undefined) ||
          r.filePath.startsWith(PREVIEW_PREFIX)
      );
      return {activeResourcesLength: activeResources.length};
    },
    builder: {
      isInitialized: scope => {
        return scope.activeResourcesLength > 0;
      },
      shouldBeVisibleBeforeInitialized: true,
    },
  };
  return subsection;
});

childSections.forEach(s => sectionBlueprintMap.register(s));

export type K8sResourceScopeType = {
  isFolderLoading: boolean;
  isFolderOpen: boolean;
  isPreviewLoading: boolean;
  activeResources: K8sResource[];
  resourceFilter: ResourceFilterType;
};

export const K8S_RESOURCE_SECTION_NAME = navSectionNames.K8S_RESOURCES;

const K8sResourceSectionBlueprint: SectionBlueprint<K8sResource, K8sResourceScopeType> = {
  name: navSectionNames.K8S_RESOURCES,
  id: navSectionNames.K8S_RESOURCES,
  rootSectionId: navSectionNames.K8S_RESOURCES,
  childSectionIds: childSectionNames,
  getScope: state => {
    return {
      isFolderLoading: state.ui.isFolderLoading,
      isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      isPreviewLoading: state.main.previewLoader.isLoading,
      activeResources: Object.values(state.main.resourceMap).filter(
        r =>
          (state.main.previewResourceId === undefined && state.main.previewValuesFileId === undefined) ||
          r.filePath.startsWith(PREVIEW_PREFIX)
      ),
      resourceFilter: state.main.resourceFilter,
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
    shouldBeVisibleBeforeInitialized: true,
  },
  customization: {
    emptyDisplay: {
      component: K8sResourceSectionEmptyDisplay,
    },
    nameSuffix: {
      component: K8sResourceSectionNameSuffix,
    },
  },
};

sectionBlueprintMap.register(K8sResourceSectionBlueprint);

export default K8sResourceSectionBlueprint;
