import React, {useCallback, useMemo} from 'react';
import {NavSection} from '@models/navsection';
import NavSectionItem from './NavSectionItem';
import * as S from './styled';

function NavSectionRenderer<ItemType, ScopeType>(props: {navSection: NavSection<ItemType, ScopeType>; level: number}) {
  const {navSection, level} = props;
  const {name, getItems, getItemsGrouped, useScope, itemHandler, subsections} = navSection;

  const scope = useScope();

  const items = useMemo(() => {
    if (getItems) {
      return getItems(scope);
    }
    return undefined;
  }, [scope, getItems]);

  const groupedItems = useMemo(() => {
    if (getItemsGrouped) {
      return getItemsGrouped(scope);
    }
    return undefined;
  }, [scope, getItemsGrouped]);

  const getItemIdentifier = useCallback(
    (item: ItemType) => {
      if (!itemHandler) {
        return null;
      }
      return itemHandler.getIdentifier(item, scope);
    },
    [scope, itemHandler]
  );

  return (
    <>
      <S.Section.Container isSelected={false} isHighlighted={false}>
        <S.Section.Name isSelected={false} isHighlighted={false} level={level}>
          {name}
        </S.Section.Name>
      </S.Section.Container>
      {itemHandler &&
        items &&
        items.map(item => (
          <NavSectionItem<ItemType, ScopeType>
            key={getItemIdentifier(item)}
            item={item}
            scope={scope}
            handler={itemHandler}
            level={level + 1}
          />
        ))}
      {itemHandler &&
        groupedItems &&
        Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <React.Fragment key={groupName}>
            <S.Section.Container isSelected={false} isHighlighted={false} style={{color: 'red'}}>
              <S.Section.Name isSelected={false} isHighlighted={false} level={level + 1}>
                {groupName}
              </S.Section.Name>
            </S.Section.Container>
            {groupItems.map(item => (
              <NavSectionItem<ItemType, ScopeType>
                key={getItemIdentifier(item)}
                item={item}
                scope={scope}
                handler={itemHandler}
                level={level + 2}
              />
            ))}
          </React.Fragment>
        ))}
      {subsections &&
        subsections.map(child => <NavSectionRenderer key={child.name} navSection={child} level={level + 1} />)}
    </>
  );
}

export default NavSectionRenderer;
