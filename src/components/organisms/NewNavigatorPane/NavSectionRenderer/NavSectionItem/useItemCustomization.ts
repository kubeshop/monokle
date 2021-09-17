import {useMemo} from 'react';
import {NavSectionItemCustomComponentProps, NavSectionItemCustomization} from '@models/navsection';

export function useItemCustomization<ItemType>(
  item: ItemType,
  customization: NavSectionItemCustomization<ItemType> = {},
  itemState: {isHovered: boolean; isSelected: boolean}
) {
  const Prefix = useMemo(() => customization.Prefix, [customization]);
  const Suffix = useMemo(() => customization.Suffix, [customization]);
  const QuickAction = useMemo(() => customization.QuickAction, [customization]);
  const ContextMenu = useMemo(() => customization.ContextMenu, [customization]);

  const customComponentProps = useMemo<NavSectionItemCustomComponentProps<ItemType>>(() => {
    return {
      item,
      isItemHovered: itemState.isHovered,
      isItemSelected: itemState.isSelected,
    };
  }, [item, itemState]);

  return {Prefix, Suffix, QuickAction, ContextMenu, customComponentProps};
}
