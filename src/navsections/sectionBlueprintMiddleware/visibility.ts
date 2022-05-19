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
  let visibleChildSectionIds: string[] = [];
  let visibleDescendantItemIds: string[] = [];
  let visibleDescendantSectionIds: string[] = [];

  sectionBlueprint.childSectionIds?.forEach(childSectionId => {
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

    if (isChildSectionVisible) {
      visibleChildSectionIds.push(childSectionId);
    }

    if (visibleDescendantSectionIdsOfChildSection) {
      visibleDescendantSectionIds.push(...visibleDescendantSectionIdsOfChildSection);
    }

    if (visibleDescendantItemIdsOfChildSection) {
      visibleDescendantItemIds.push(...visibleDescendantItemIdsOfChildSection);
    }
  });

  sectionInstance.isVisible = sectionInstance.isVisible || Boolean(visibleChildSectionIds.length);

  visibleDescendantItemIds.push(...sectionInstance.visibleItemIds);
  sectionInstance.visibleDescendantItemIds = visibleDescendantItemIds;

  sectionInstance.visibleChildSectionIds = visibleChildSectionIds;
  visibleDescendantSectionIds.push(...visibleChildSectionIds);
  sectionInstance.visibleDescendantSectionIds = visibleDescendantSectionIds;

  return [
    sectionInstance.isVisible,
    sectionInstance.visibleDescendantSectionIds,
    sectionInstance.visibleDescendantItemIds,
  ];
}
