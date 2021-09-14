import {useMemo} from 'react';
import {NavSectionItemHandler} from '@models/navsection';

export function useNavSectionItem<ItemType, ScopeType>(
  item: ItemType,
  scope: ScopeType,
  handler: NavSectionItemHandler<ItemType, ScopeType>
) {
  const name = useMemo(() => {
    return handler.getName(item);
  }, [handler, item]);

  const isSelected = useMemo(() => {
    return Boolean(handler.isSelected && handler.isSelected(item, scope));
  }, [handler, scope, item]);

  const isHighlighted = useMemo(() => {
    return Boolean(handler.isHighlighted && handler.isHighlighted(item, scope));
  }, [handler, scope, item]);

  return {name, isSelected, isHighlighted};
}
