export interface NavSectionItemHandler<ItemType, ScopeType> {
  getName: <S extends ScopeType>(item: ItemType, scope: S) => string;
  getIdentifier: <S extends ScopeType>(item: ItemType, scope: S) => string;
  isSelected?: <S extends ScopeType>(item: ItemType, scope: S) => boolean;
  isHighlighted?: <S extends ScopeType>(item: ItemType, scope: S) => boolean;
  isVisible?: <S extends ScopeType>(item: ItemType, scope: S) => boolean;
  onClick?: <S extends ScopeType>(item: ItemType, scope: S) => void;
}

export interface NavSection<ItemType, ScopeType = any> {
  name: string;
  useScope: () => ScopeType;
  subsections?: NavSection<ItemType, ScopeType>[];
  getItems?: <S extends ScopeType>(scope: S) => ItemType[];
  getItemsGrouped?: <S extends ScopeType>(scope: S) => Record<string, ItemType[]>;
  itemHandler?: NavSectionItemHandler<ItemType, ScopeType>;
}
