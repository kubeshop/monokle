import React from 'react';

import {AppDispatch, RootState} from '@redux/store';

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
  nameDisplay?: {
    component: ItemCustomComponent;
    options?: ItemCustomComponentOptions;
  };
  disableHoverStyle?: boolean;
}

export type SectionCustomComponentProps = {
  sectionInstance: SectionInstance;
};

export type SectionCustomComponent = React.ComponentType<SectionCustomComponentProps>;

export interface SectionCustomization {
  nameDisplay?: {
    component: SectionCustomComponent;
  };
  nameSuffix?: {
    component: SectionCustomComponent;
  };
  emptyDisplay?: {
    component: SectionCustomComponent;
  };
  disableHoverStyle?: boolean;
}

export interface ItemBlueprint<RawItemType, ScopeType> {
  getName: (rawItem: RawItemType, scope: ScopeType) => string;
  getInstanceId: (rawItem: RawItemType, scope: ScopeType) => string;
  builder?: {
    isSelected?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isHighlighted?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isVisible?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isDirty?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isDisabled?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    shouldScrollIntoView?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    getMeta?: (rawItem: RawItemType, scope: ScopeType) => any;
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
    isEmpty?: (scope: ScopeType, items: RawItemType[], itemInstances?: ItemInstance[]) => boolean;
    shouldBeVisibleBeforeInitialized?: boolean;
  };
  customization?: SectionCustomization;
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
  meta?: any;
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
  isEmpty: boolean;
  shouldExpand: boolean;
}

export interface NavigatorInstanceState {
  sectionInstanceMap: Record<string, SectionInstance>;
  itemInstanceMap: Record<string, ItemInstance>;
}

export interface NavigatorState extends NavigatorInstanceState {
  collapsedSectionIds: string[];
}
