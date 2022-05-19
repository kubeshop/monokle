import {SectionBlueprint, SectionInstance} from '@models/navigator';

import sectionBlueprintMap from '../sectionBlueprintMap';

/**
 * Compute the visibility of each section based on the visibility of it's children
 * Compute the array of all visible descendant sections for each section
 */
export function computeSectionVisibility(
  sectionInstance: SectionInstance,
  sectionInstanceMap: Record<string, SectionInstance>,
  sectionBlueprint: SectionBlueprint<any, any>
): [boolean, string[] | undefined, string[] | undefined] {
  let visibleDescendantItemIds: string[] = [];

  if (sectionBlueprint.childSectionIds && sectionBlueprint.childSectionIds.length > 0) {
    const childSectionVisibilityMap: Record<string, boolean> = {};

    sectionBlueprint.childSectionIds.forEach(childSectionId => {
      const childSectionInstance = sectionInstanceMap[childSectionId];
      if (!childSectionInstance) {
        return;
      }
      const childSectionBlueprint = sectionBlueprintMap.getById(childSectionInstance.id);
      if (!childSectionBlueprint) {
        return;
      }
      const [isChildSectionVisible, visibleDescendantSectionIdsOfChildSection, visibleDescendantItemIdsOfChildSection] =
        computeSectionVisibility(childSectionInstance, sectionInstanceMap, childSectionBlueprint);

      if (visibleDescendantSectionIdsOfChildSection) {
        if (sectionInstance.visibleDescendantSectionIds) {
          sectionInstance.visibleDescendantSectionIds.push(...visibleDescendantSectionIdsOfChildSection);
        } else {
          sectionInstance.visibleDescendantSectionIds = [...visibleDescendantSectionIdsOfChildSection];
        }
      }

      if (visibleDescendantItemIdsOfChildSection) {
        visibleDescendantItemIds.push(...visibleDescendantItemIdsOfChildSection);
      }

      childSectionVisibilityMap[childSectionId] = isChildSectionVisible;
      if (isChildSectionVisible) {
        if (sectionInstance.visibleChildSectionIds) {
          sectionInstance.visibleChildSectionIds.push(childSectionId);
        } else {
          sectionInstance.visibleChildSectionIds = [childSectionId];
        }
      }
    });

    if (sectionInstance.visibleChildSectionIds) {
      if (sectionInstance.visibleDescendantSectionIds) {
        sectionInstance.visibleDescendantSectionIds.push(...sectionInstance.visibleChildSectionIds);
        sectionInstance.visibleDescendantSectionIds = [...new Set(sectionInstance.visibleDescendantSectionIds)];
      } else {
        sectionInstance.visibleDescendantSectionIds = [...sectionInstance.visibleChildSectionIds];
      }
    }

    sectionInstance.isVisible =
      sectionInstance.isVisible || Object.values(childSectionVisibilityMap).some(isVisible => isVisible === true);
  }

  if (sectionInstance.visibleItemIds) {
    visibleDescendantItemIds.push(...sectionInstance.visibleItemIds);
  }

  sectionInstance.visibleDescendantItemIds = visibleDescendantItemIds;
  return [
    sectionInstance.isVisible,
    sectionInstance.visibleDescendantSectionIds,
    sectionInstance.visibleDescendantItemIds,
  ];
}
