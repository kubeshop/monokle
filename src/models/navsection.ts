import React from 'react';

export type NavSectionItemCustomComponentProps<ItemType> = {
  item: ItemType;
  isItemHovered: boolean;
  isItemSelected: boolean;
};

export type NavSectionItemCustomComponent<ItemType> = React.ComponentType<NavSectionItemCustomComponentProps<ItemType>>;

export interface NavSectionItemCustomization<ItemType> {
  Prefix?: NavSectionItemCustomComponent<ItemType>;
  Suffix?: NavSectionItemCustomComponent<ItemType>;
  QuickAction?: NavSectionItemCustomComponent<ItemType>;
  ContextMenu?: NavSectionItemCustomComponent<ItemType>;
}

export interface NavSectionItemHandler<ItemType, ScopeType> {
  getName: (item: ItemType) => string;
  getIdentifier: (item: ItemType) => string;
  isSelected?: (item: ItemType, scope: ScopeType) => boolean;
  isHighlighted?: (item: ItemType, scope: ScopeType) => boolean;
  isVisible?: (item: ItemType, scope: ScopeType) => boolean;
  isDirty?: (item: ItemType, scope: ScopeType) => boolean;
  isDisabled?: (item: ItemType, scope: ScopeType) => boolean;
  shouldScrollIntoView?: (item: ItemType, scope: ScopeType) => boolean;
  onClick?: (item: ItemType, scope: ScopeType) => void;
}

export interface NavSection<ItemType, ScopeType = any> {
  name: string;
  useScope: () => ScopeType;
  subsectionNames?: string[];
  getItems?: (scope: ScopeType) => ItemType[];
  getItemsGrouped?: (scope: ScopeType) => Record<string, ItemType[]>;
  isLoading?: (scope: ScopeType, items: ItemType[]) => boolean;
  isVisible?: (scope: ScopeType, items: ItemType[]) => boolean;
  itemHandler?: NavSectionItemHandler<ItemType, ScopeType>;
  itemCustomization?: NavSectionItemCustomization<ItemType>;
}
