import {AppDispatch, RootState} from '@redux/store';
import React from 'react';

export type NavSectionItemCustomComponentProps<ItemType> = {
  item: ItemType;
  isItemHovered: boolean;
  isItemSelected: boolean;
  isItemDisabled: boolean;
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
  onClick?: (item: ItemType, scope: ScopeType, dispatch: AppDispatch) => void;
}

interface NavSectionItemGroup<ItemType> {
  groupId: string;
  groupName: string;
  groupItems: ItemType[];
}

export interface NavSection<ItemType, ScopeType = any> {
  name: string;
  id: string;
  subsectionNames?: string[];
  getScope: (state: RootState) => ScopeType;
  getItems?: (scope: ScopeType) => ItemType[];
  getGroups?: (scope: ScopeType) => NavSectionItemGroup<ItemType>[];
  isLoading?: (scope: ScopeType, items: ItemType[]) => boolean;
  isVisible?: (scope: ScopeType, items: ItemType[]) => boolean;
  isInitialized?: (scope: ScopeType, items: ItemType[]) => boolean;
  itemHandler?: NavSectionItemHandler<ItemType, ScopeType>;
  itemCustomization?: NavSectionItemCustomization<ItemType>;
}

export interface NavSectionItemInstance {
  name: string;
  id: string;
  isSelected: boolean;
  isHighlighted: boolean;
  isVisible: boolean;
  isDirty: boolean;
  isDisabled: boolean;
  shouldScrollIntoView: boolean;
}

export interface NavSectionItemGroupInstance {
  groupId: string;
  groupName: string;
  groupItemIds: string[];
}

export interface NavSectionInstance {
  name: string;
  subsectionNames?: string[];
  itemIds?: string[];
  groupIds?: NavSectionItemGroupInstance[];
  isLoading?: boolean;
  isVisible?: boolean;
  isInitialized?: boolean;
}

export interface NavSectionState {
  instanceMap: Record<string, NavSectionInstance>;
  itemInstanceMap: Record<string, NavSectionItemInstance>;
  itemGroupInstanceMap: Record<string, NavSectionItemGroupInstance>;
  scopeMap: Record<string, Record<string, any>>;
}

export interface UpdateNavSectionStatePayload {
  instances: NavSectionInstance[];
  itemInstances: NavSectionItemInstance[];
  scopeMap: Record<string, Record<string, any>>;
}
