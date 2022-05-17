import React, {ReactNode} from 'react';

import {ActionCreatorWithPayload, AnyAction} from '@reduxjs/toolkit';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

export type ItemCustomComponentProps = {
  itemInstance: ItemInstance;
  options?: ItemCustomComponentOptions;
  children?: ReactNode;
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
  contextMenuWrapper?: {
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
  isCheckVisibleOnHover?: boolean;
  lastItemMarginBottom?: number;
}

export type SectionCustomComponentProps = {
  sectionInstance: SectionInstance;
  onClick?: () => void;
};

export type SectionCustomComponent = React.ComponentType<SectionCustomComponentProps>;

export interface SectionCustomization {
  nameDisplay?: {
    component: SectionCustomComponent;
  };
  nameSuffix?: {
    component: SectionCustomComponent;
    options?: {
      isVisibleOnHover: boolean;
    };
  };
  emptyDisplay?: {
    component: SectionCustomComponent;
  };
  nameContext?: {
    component: SectionCustomComponent;
  };
  nameCounter?: {
    component: SectionCustomComponent;
  };
  namePrefix?: {
    component: SectionCustomComponent;
  };

  beforeInitializationText?: string;
  /** If no value is provided, default value will be "descendants" */
  counterDisplayMode?: 'descendants' | 'items' | 'subsections' | 'none';
  disableHoverStyle?: boolean;
  emptyGroupText?: string;
  emptyVisibleItemsText?: string;
  /** Number of pixels to indent this section, by default all sections/susections are aligned */
  indentation?: number;
  isCheckVisibleOnHover?: boolean;
  nameColor?: string;
  nameHorizontalPadding?: number;
  nameSize?: number;
  nameVerticalPadding?: number;
  nameWeight?: number;
  sectionMarginBottom?: number;
  showHeader?: boolean;
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
    isCheckable?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    isChecked?: (rawItem: RawItemType, scope: ScopeType) => boolean;
    getMeta?: (rawItem: RawItemType, scope: ScopeType) => any;
  };
  instanceHandler?: {
    onClick?: (itemInstance: ItemInstance, dispatch: AppDispatch) => void;
    onCheck?: (itemInstance: ItemInstance, dispatch: AppDispatch) => void;
  };
  customization?: ItemCustomization;
}

export interface ItemGroupBlueprint {
  id: string;
  name: string;
  itemIds: string[];
}

export interface SectionBlueprint<RawItemType, ScopeType = any> {
  id: string;
  name: string;
  getScope: (state: RootState) => ScopeType;
  containerElementId: string;
  rootSectionId: string;
  childSectionIds?: string[];
  builder?: {
    transformName?: (originalName: string, scope: ScopeType) => string;
    getRawItems?: (scope: ScopeType) => RawItemType[];
    getGroups?: (scope: ScopeType) => ItemGroupBlueprint[];
    getMeta?: (scope: ScopeType, items: RawItemType[]) => any;
    isLoading?: (scope: ScopeType, items: RawItemType[]) => boolean;
    isVisible?: (scope: ScopeType, items: RawItemType[]) => boolean;
    isInitialized?: (scope: ScopeType, items: RawItemType[]) => boolean;
    isEmpty?: (scope: ScopeType, items: RawItemType[], itemInstances?: ItemInstance[]) => boolean;
    makeCheckable?: (scope: ScopeType) => {
      checkedItemIds: string[];
      checkItemsActionCreator: ActionCreatorWithPayload<string[]>;
      uncheckItemsActionCreator: ActionCreatorWithPayload<string[]>;
    };
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
  sectionId: string;
  rootSectionId: string;
  name: string;
  isSelected: boolean;
  isHighlighted: boolean;
  isVisible: boolean;
  isDirty: boolean;
  isDisabled: boolean;
  isCheckable: boolean;
  isChecked: boolean;
  shouldScrollIntoView?: boolean;
  meta?: any;
}

export interface SectionInstance {
  id: string;
  name: string;
  rootSectionId: string;
  itemIds: string[];
  groups: ItemGroupInstance[];
  visibleItemIds: string[];
  visibleGroupIds: string[];
  visibleChildSectionIds?: string[];
  visibleDescendantSectionIds?: string[];
  visibleDescendantItemIds?: string[];
  isLoading: boolean;
  isVisible: boolean;
  isInitialized: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isEmpty: boolean;
  checkable?: {
    value: 'unchecked' | 'partial' | 'checked';
    checkItemsAction: AnyAction;
    uncheckItemsAction: AnyAction;
  };
  shouldExpand: boolean;
  meta?: any;
}

export interface NavigatorInstanceState {
  sectionInstanceMap: Record<string, SectionInstance>;
  itemInstanceMap: Record<string, ItemInstance>;
}

export interface NavigatorState extends NavigatorInstanceState {
  collapsedSectionIds: string[];
  registeredSectionBlueprintIds: string[];
}
