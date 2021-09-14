import React from 'react';

export type NavSectionScopedMethod<ScopeType, MethodReturnType> = <S extends ScopeType>(scope: S) => MethodReturnType;

export type NavSectionScopedItemMethod<ItemType, ScopeType, MethodReturnType> = <S extends ScopeType>(
  item: ItemType,
  scope: S
) => MethodReturnType;

export type NavSectionItemCustomComponentProps<ItemType> = {
  item: ItemType;
  isItemHovered: boolean;
};

export type NavSectionItemCustomComponent<ItemType> = React.ComponentType<NavSectionItemCustomComponentProps<ItemType>>;

export interface NavSectionItemCustomization<ItemType> {
  Prefix?: NavSectionItemCustomComponent<ItemType>;
  Suffix?: NavSectionItemCustomComponent<ItemType>;
  QuickAction?: NavSectionItemCustomComponent<ItemType>;
}

export interface NavSectionItemHandler<ItemType, ScopeType> {
  getName: (item: ItemType) => string;
  getIdentifier: (item: ItemType) => string;
  isSelected?: NavSectionScopedItemMethod<ItemType, ScopeType, boolean>;
  isHighlighted?: NavSectionScopedItemMethod<ItemType, ScopeType, boolean>;
  isVisible?: NavSectionScopedItemMethod<ItemType, ScopeType, boolean>;
  onClick?: NavSectionScopedItemMethod<ItemType, ScopeType, void>;
}

export interface NavSection<ItemType, ScopeType = any> {
  name: string;
  useScope: () => ScopeType;
  subsections?: NavSection<ItemType, ScopeType>[];
  getItems?: NavSectionScopedMethod<ScopeType, ItemType[]>;
  getItemsGrouped?: NavSectionScopedMethod<ScopeType, Record<string, ItemType[]>>;
  itemHandler?: NavSectionItemHandler<ItemType, ScopeType>;
  itemCustomization?: NavSectionItemCustomization<ItemType>;
}
