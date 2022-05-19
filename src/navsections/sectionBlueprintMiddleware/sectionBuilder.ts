import _ from 'lodash';

import {ItemInstance, SectionBlueprint, SectionInstance} from '@models/navigator';

type BuildSectionInstanceProps = {
  itemInstances: ItemInstance[];
  rawItems: any[];
  sectionBlueprint: SectionBlueprint<any, any>;
  sectionScope: Record<string, any>;
};

export const buildSectionInstance = (props: BuildSectionInstanceProps) => {
  const {itemInstances, sectionBlueprint, sectionScope, rawItems} = props;
  const sectionBuilder = sectionBlueprint.builder;

  const isSectionSelected = Boolean(itemInstances?.some(i => i.isSelected === true));
  const isSectionHighlighted = Boolean(itemInstances?.some(i => i.isHighlighted === true));
  const isSectionInitialized = Boolean(
    sectionBuilder?.isInitialized ? sectionBuilder.isInitialized(sectionScope, rawItems) : true
  );
  const isSectionEmpty = Boolean(
    sectionBuilder?.isEmpty ? sectionBuilder.isEmpty(sectionScope, rawItems, itemInstances) : false
  );

  const visibleItemIds = itemInstances
    ? _(itemInstances)
        .filter(i => i.isVisible === true)
        .map(i => i.id)
        .value()
    : [];

  const sectionInstance: SectionInstance = {
    id: sectionBlueprint.id,
    name: sectionBuilder?.transformName
      ? sectionBuilder.transformName(sectionBlueprint.name, sectionScope)
      : sectionBlueprint.name,
    rootSectionId: sectionBlueprint.rootSectionId,
    itemIds: itemInstances?.map(i => i.id) || [],
    isLoading: Boolean(sectionBuilder?.isLoading ? sectionBuilder.isLoading(sectionScope, rawItems) : false),
    isVisible:
      Boolean(sectionBuilder?.shouldBeVisibleBeforeInitialized === true && !isSectionInitialized) ||
      (sectionBlueprint && sectionBlueprint.customization?.emptyDisplay && isSectionEmpty) ||
      (isSectionInitialized &&
        Boolean(
          sectionBuilder?.isVisible ? sectionBuilder.isVisible(sectionScope, rawItems) : visibleItemIds.length > 0
        )),
    isInitialized: isSectionInitialized,
    isSelected: isSectionSelected,
    isHighlighted: isSectionHighlighted,
    isEmpty: isSectionEmpty,
    meta: sectionBuilder?.getMeta ? sectionBuilder.getMeta(sectionScope, rawItems) : undefined,
    shouldExpand: Boolean(
      itemInstances?.some(itemInstance => itemInstance.isVisible && itemInstance.shouldScrollIntoView)
    ),
    visibleItemIds,
  };

  return sectionInstance;
};
