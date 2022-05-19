import {ItemInstance, SectionBlueprint} from '@models/navigator';

type BuildItemInstancesProps = {
  sectionScope: Record<string, any>;
  sectionBlueprint: SectionBlueprint<any, any>;
};

type BuildItemInstanceReturn = {
  itemInstances: ItemInstance[];
  rawItems: any[];
};

export const buildItemInstances = (props: BuildItemInstancesProps): BuildItemInstanceReturn => {
  const {sectionBlueprint, sectionScope} = props;
  const itemBlueprint = sectionBlueprint.itemBlueprint;

  let itemInstances: ItemInstance[] | undefined;
  let rawItems: any[] = [];

  // build the item instances if the section has the itemBlueprint defined
  if (itemBlueprint) {
    rawItems = (sectionBlueprint.builder?.getRawItems && sectionBlueprint.builder.getRawItems(sectionScope)) || [];
    const itemBuilder = itemBlueprint.builder;
    itemInstances = rawItems?.map(rawItem => {
      return {
        name: itemBlueprint.getName(rawItem, sectionScope),
        id: itemBlueprint.getInstanceId(rawItem, sectionScope),
        sectionId: sectionBlueprint.id,
        rootSectionId: sectionBlueprint.rootSectionId,
        isSelected: Boolean(itemBuilder?.isSelected ? itemBuilder.isSelected(rawItem, sectionScope) : false),
        isHighlighted: Boolean(itemBuilder?.isHighlighted ? itemBuilder.isHighlighted(rawItem, sectionScope) : false),
        isVisible: Boolean(itemBuilder?.isVisible ? itemBuilder.isVisible(rawItem, sectionScope) : true),
        isDirty: Boolean(itemBuilder?.isDirty ? itemBuilder.isDirty(rawItem, sectionScope) : false),
        isDisabled: Boolean(itemBuilder?.isDisabled ? itemBuilder.isDisabled(rawItem, sectionScope) : false),
        isCheckable: Boolean(itemBuilder?.isCheckable ? itemBuilder.isCheckable(rawItem, sectionScope) : false),
        isChecked: Boolean(itemBuilder?.isChecked ? itemBuilder.isChecked(rawItem, sectionScope) : false),
        meta: itemBuilder?.getMeta ? itemBuilder.getMeta(rawItem, sectionScope) : undefined,
      };
    });
  }

  return {
    itemInstances: itemInstances || [],
    rawItems,
  };
};
