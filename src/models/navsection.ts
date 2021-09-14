import React from 'react';

export type NavSectionScopedItemMethod<ItemType, ScopeType, MethodReturnType> = <S extends ScopeType>(
  item: ItemType,
  scope: S
) => MethodReturnType;

export interface NavSectionItemHandler<ItemType, ScopeType> {
  getName: (item: ItemType) => string;
  getIdentifier: (item: ItemType) => string;
  isSelected?: NavSectionScopedItemMethod<ItemType, ScopeType, boolean>;
  isHighlighted?: NavSectionScopedItemMethod<ItemType, ScopeType, boolean>;
  isVisible?: NavSectionScopedItemMethod<ItemType, ScopeType, boolean>;
  onClick?: NavSectionScopedItemMethod<ItemType, ScopeType, void>;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export interface NavSection<ItemType, ScopeType = any> {
  name: string;
  useScope: () => ScopeType;
  subsections?: NavSection<ItemType, ScopeType>[];
  getItems?: <S extends ScopeType>(scope: S) => ItemType[];
  getItemsGrouped?: <S extends ScopeType>(scope: S) => Record<string, ItemType[]>;
  itemHandler?: NavSectionItemHandler<ItemType, ScopeType>;
}
