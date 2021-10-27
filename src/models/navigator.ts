import {AppDispatch, RootState} from '@redux/store';
import React from 'react';

export type ItemCustomComponentProps = {
  itemInstance: ItemInstance;
  options?: ItemCustomComponentOptions;
};

export type ItemCustomComponent = React.ComponentType<ItemCustomComponentProps>;

export type ItemCustomComponentOptions = {
  isVisibleOnHover: boolean;
};

export interface ItemCustomization {
  prefix?: {
    component: ItemCustomComponent;
    options?: ItemCustomComponentOptions;
  };
  suffix?: {
    component: ItemCustomComponent;
    options?: ItemCustomComponentOptions;
  };
  quickAction?: {
    component: ItemCustomComponent;
    options?: ItemCustomComponentOptions;
  };
  contextMenu?: {
    component: ItemCustomComponent;
    options?: ItemCustomComponentOptions;
  };
}

export interface ItemBlueprint<RawItemType, ScopeType> {
  getName: (rawItem: RawItemType) => string;
  getInstanceId: (rawItem: RawItemType) => string;
  builder?: {
    isSelected?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isHighlighted?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isVisible?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isDirty?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isDisabled?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    shouldScrollIntoView?: (rawItem: RawItemType, scope: ScopeType) => boolean;
  };
  instanceHandler?: {
    onClick?: (itemInstance: ItemInstance, dispatch: AppDispatch) => void;
  };
  customization?: ItemCustomization;
}

export interface ItemGroupBlueprint {
  id: string;
  name: string;
  itemIds: string[];
}

export interface SectionBlueprint<RawItemType, ScopeType = any> {
  name: string;
  id: string;
  getScope: (state: RootState) => ScopeType;
  parentSectionId?: string;
  childSectionIds?: string[];
  builder?: {
    getRawItems?: (scope: ScopeType) => RawItemType[];
    getGroups?: (scope: ScopeType) => ItemGroupBlueprint[];
    isLoading?: (scope: ScopeType, items: RawItemType[]) => boolean;
    isVisible?: (scope: ScopeType, items: RawItemType[]) => boolean;
    isInitialized?: (scope: ScopeType, items: RawItemType[]) => boolean;
    shouldBeVisibleBeforeInitialized?: boolean;
  };
  itemBlueprint?: ItemBlueprint<RawItemType, ScopeType>;
}

export interface ItemGroupInstance extends ItemGroupBlueprint {
  visibleItemIds: string[];
}

export interface ItemInstance {
  id: string;
  name: string;
  isSelected: boolean;
  isHighlighted: boolean;
  isVisible: boolean;
  isDirty: boolean;
  isDisabled: boolean;
  shouldScrollIntoView: boolean;
}

export interface SectionInstance {
  id: string;
  itemIds: string[];
  groups: ItemGroupInstance[];
  visibleItemIds: string[];
  visibleGroupIds: string[];
  visibleChildSectionIds?: string[];
  visibleDescendantSectionIds?: string[];
  visibleDescendantItemsCount?: number;
  isLoading: boolean;
  isVisible: boolean;
  isInitialized: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  shouldExpand: boolean;
}

export interface NavigatorInstanceState {
  sectionInstanceMap: Record<string, SectionInstance>;
  itemInstanceMap: Record<string, ItemInstance>;
}

export interface NavigatorState extends NavigatorInstanceState {
  collapsedSectionIds: string[];
}
