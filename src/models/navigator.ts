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
  /** If no value is provided, default value will be "descendants". */
  counterDisplayMode?: 'descendants' | 'items' | 'subsections' | 'none';
  // TODO: can we remove disableHoverStyle? maybe allow a custom `style` object? or probably a method that receives the old style and creates the new one?
  disableHoverStyle?: boolean;
  isCheckVisibleOnHover?: boolean;
}

export interface RowBuilder<InstanceType> {
  /** If not specified, the default value will be 25. */
  height?: number | ((instance: InstanceType) => number);
  /** If not specified, the default value will be rowHeight * 0.75 */
  fontSize?: number | ((instance: InstanceType) => number);
  /** If not specified, the default value will be 0. */
  indentation?: number | ((instance: InstanceType) => number);
  /** If not specified, the default value will be 0. */
  marginBottom?: number | ((instance: InstanceType) => number);
}

export interface ItemBlueprint<RawItemType, ScopeType> {
  getName: (rawItem: RawItemType, scope: ScopeType) => string;
  getInstanceId: (rawItem: RawItemType, scope: ScopeType) => string;
  rowBuilder?: RowBuilder<ItemInstance>;
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
  rowBuilder?: RowBuilder<SectionInstance>;
  rootSectionId: string;
  childSectionIds?: string[];
  builder?: {
    transformName?: (originalName: string, scope: ScopeType) => string;
    getRawItems?: (scope: ScopeType) => RawItemType[];
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
  isLast: boolean;
  meta?: any;
}

export interface SectionInstance {
  id: string;
  name: string;
  rootSectionId: string;
  itemIds: string[];
  visibleItemIds: string[];
  visibleChildSectionIds?: string[];
  visibleDescendantItemIds?: string[];
  visibleDescendantSectionIds?: string[];
  isCollapsed: boolean;
  isLoading: boolean;
  isVisible: boolean;
  isInitialized: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isEmpty: boolean;
  isLast: boolean;
  checkable?: {
    value: 'unchecked' | 'partial' | 'checked';
    checkItemsAction: AnyAction;
    uncheckItemsAction: AnyAction;
  };
  meta?: any;
}

export type NavigatorSectionRow = {
  type: 'section';
  id: string;
  level: number; // TODO: is the level needed?
  fontSize: number;
  indentation: number;
  height: number;
  marginBottom: number;
};

export type NavigatorItemRow = {
  type: 'item';
  id: string;
  sectionId: string;
  level: number;
  fontSize: number;
  indentation: number;
  height: number;
  marginBottom: number;
};

export type NavigatorRow = NavigatorSectionRow | NavigatorItemRow;

export interface NavigatorInstanceState {
  sectionInstanceMap: Record<string, SectionInstance>;
  itemInstanceMap: Record<string, ItemInstance>;
  rowsByRootSectionId: Record<string, NavigatorRow[]>;
  rowIndexToScrollByRootSectionId: Record<string, number | undefined>;
}

export interface NavigatorState extends NavigatorInstanceState {
  collapsedSectionIds: string[];
  registeredSectionBlueprintIds: string[];
}
