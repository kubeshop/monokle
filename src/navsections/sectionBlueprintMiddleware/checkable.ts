import {SectionBlueprint, SectionInstance} from '@models/navigator';

export function computeSectionCheckable(
  sectionBlueprint: SectionBlueprint<any>,
  sectionInstance: SectionInstance,
  sectionScope: Record<string, any>
) {
  if (!sectionBlueprint.builder?.makeCheckable || !sectionInstance.visibleDescendantItemIds) {
    sectionInstance.checkable = undefined;
    return;
  }

  const {checkedItemIds, checkItemsActionCreator, uncheckItemsActionCreator} =
    sectionBlueprint.builder.makeCheckable(sectionScope);
  let nrOfCheckedItems = 0;

  sectionInstance.visibleDescendantItemIds.forEach(itemId => {
    if (checkedItemIds.includes(itemId)) {
      nrOfCheckedItems += 1;
    }
  });

  const isChecked =
    nrOfCheckedItems === 0
      ? 'unchecked'
      : nrOfCheckedItems < sectionInstance.visibleDescendantItemIds.length
      ? 'partial'
      : 'checked';

  sectionInstance.checkable = {
    value: isChecked,
    checkItemsAction: checkItemsActionCreator(sectionInstance.visibleDescendantItemIds),
    uncheckItemsAction: uncheckItemsActionCreator(sectionInstance.visibleDescendantItemIds),
  };
}
