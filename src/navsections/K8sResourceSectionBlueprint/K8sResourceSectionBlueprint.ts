import navSectionNames from '@constants/navSectionNames';
import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandlers} from '@src/kindhandlers';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';
import {SectionBlueprint} from '@models/navigator';
import {PREVIEW_PREFIX} from '@constants/constants';
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

export type K8sResourceScopeType = {
  isFolderLoading: boolean;
  isPreviewLoading: boolean;
  activeResourcesLength: number;
};

const childSections = childSectionNames.map(childSectionName => {
  const kindHandlerSections = (kindHandlersBySubsectionName[childSectionName] || []).map(kindHandler =>
    makeResourceKindNavSection(kindHandler)
  );

  kindHandlerSections.forEach(k => sectionBlueprintMap.register(k));

  const subsection: SectionBlueprint<K8sResource, {activeResources: K8sResource[]}> = {
    name: childSectionName,
    id: childSectionName,
    childSectionIds: kindHandlerSections.map(k => k.name),
    getScope: state => {
      const activeResources = Object.values(state.main.resourceMap).filter(
        r =>
          (state.main.previewResourceId === undefined && state.main.previewValuesFileId === undefined) ||
          r.filePath.startsWith(PREVIEW_PREFIX)
      );
      return {activeResources};
    },
    builder: {
      isInitialized: scope => {
        return scope.activeResources.length > 0;
      },
    },
  };
  return subsection;
});

childSections.forEach(s => sectionBlueprintMap.register(s));

const K8sResourceSectionBlueprint: SectionBlueprint<K8sResource, K8sResourceScopeType> = {
  name: navSectionNames.K8S_RESOURCES,
  id: navSectionNames.K8S_RESOURCES,
  childSectionIds: childSectionNames,
  getScope: state => {
    return {
      isFolderLoading: state.ui.isFolderLoading,
      isPreviewLoading: state.main.previewLoader.isLoading,
      activeResourcesLength: Object.values(state.main.resourceMap).filter(
        r =>
          (state.main.previewResourceId === undefined && state.main.previewValuesFileId === undefined) ||
          r.filePath.startsWith(PREVIEW_PREFIX)
      ).length,
    };
  },
  builder: {
    isLoading: scope => {
      return scope.isFolderLoading || scope.isPreviewLoading;
    },
    isInitialized: scope => {
      return scope.activeResourcesLength > 0;
    },
  },
};

sectionBlueprintMap.register(K8sResourceSectionBlueprint);

export default K8sResourceSectionBlueprint;
