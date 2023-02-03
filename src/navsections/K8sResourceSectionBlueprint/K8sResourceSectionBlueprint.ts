import {isEmpty} from 'lodash';

import navSectionNames from '@constants/navSectionNames';

import {
  activeResourceCountSelector,
  activeResourceMetaMapSelector,
  transientResourceCountSelector,
  transientResourceMetaMapSelector,
} from '@redux/selectors/resourceMapSelectors';

import {isResourcePassingFilter} from '@utils/resources';

import {KindHandlersEventEmitter, ResourceKindHandlers} from '@src/kindhandlers';
import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceFilterType} from '@shared/models/appState';
import {ResourceIdentifier, ResourceMeta, ResourceMetaMap} from '@shared/models/k8sResource';
import {SectionBlueprint} from '@shared/models/navigator';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

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
  const subsection: SectionBlueprint<
    ResourceMeta,
    {activeResourcesLength: number; transientResourcesLength: number; checkedResourceIds: ResourceIdentifier[]}
  > = {
    name: subsectionName,
    id: subsectionName,
    containerElementId: 'navigator-sections-container',
    childSectionIds,
    rootSectionId: navSectionNames.K8S_RESOURCES,
    getScope: state => {
      return {
        activeResourcesLength: activeResourceCountSelector(state),
        transientResourcesLength: transientResourceCountSelector(state),
        checkedResourceIds: state.main.checkedResourceIdentifiers,
      };
    },
    builder: {
      isInitialized: scope => {
        return scope.activeResourcesLength > 0;
      },
      // makeCheckable: scope => {
      //   return {
      //     checkedItemIds: scope.checkedResourceIds,
      //     checkItemsActionCreator: checkMultipleResourceIds,
      //     uncheckItemsActionCreator: uncheckMultipleResourceIds,
      //   };
      // },
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
  activeResourceMetaMap: ResourceMetaMap;
  transientResourceMetaMap: ResourceMetaMap<'transient'>;
  resourceFilter: ResourceFilterType;
  checkedResourceIds: ResourceIdentifier[];
};

export const K8S_RESOURCE_SECTION_NAME = navSectionNames.K8S_RESOURCES;

const K8sResourceSectionBlueprint: SectionBlueprint<ResourceMeta, K8sResourceScopeType> = {
  name: navSectionNames.K8S_RESOURCES,
  id: navSectionNames.K8S_RESOURCES,
  containerElementId: 'navigator-sections-container',
  rootSectionId: navSectionNames.K8S_RESOURCES,
  childSectionIds: childSectionNames,
  getScope: state => {
    return {
      isFolderLoading: state.ui.isFolderLoading,
      isFolderOpen: Boolean(state.main.fileMap[ROOT_FILE_ENTRY]),
      isPreviewLoading: Boolean(state.main.previewOptions.isLoading),
      activeResourceMetaMap: activeResourceMetaMapSelector(state),
      transientResourceMetaMap: transientResourceMetaMapSelector(state),
      resourceFilter: state.main.resourceFilter,
      checkedResourceIds: state.main.checkedResourceIdentifiers,
    };
  },
  builder: {
    isLoading: scope => {
      return scope.isFolderLoading || scope.isPreviewLoading;
    },
    isInitialized: scope => {
      return !isEmpty(scope.activeResourceMetaMap) || !isEmpty(scope.transientResourceMetaMap);
    },
    isEmpty: scope => {
      return (
        scope.isFolderOpen &&
        ((isEmpty(scope.activeResourceMetaMap) && isEmpty(scope.transientResourceMetaMap)) ||
          (Object.values(scope.activeResourceMetaMap).every(
            resource => !isResourcePassingFilter(resource, scope.resourceFilter)
          ) &&
            Object.values(scope.transientResourceMetaMap).every(
              resource => !isResourcePassingFilter(resource, scope.resourceFilter)
            )))
      );
    },
    // makeCheckable: scope => {
    //   return {
    //     checkedItemIds: scope.checkedResourceIds,
    //     checkItemsActionCreator: checkMultipleResourceIds,
    //     uncheckItemsActionCreator: uncheckMultipleResourceIds,
    //   };
    // },
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
