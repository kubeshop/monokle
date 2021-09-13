import React, {useCallback, useMemo} from 'react';
import {NavSectionItemHandlers, NavSection} from '@models/navsection';
import * as S from './NavSectionRenderer.styled';

function NavSectionItem<ItemType, ScopeType>(props: {
  item: ItemType;
  scope: ScopeType;
  handlers: NavSectionItemHandlers<ItemType, ScopeType>;
  level: number;
}) {
  const {item, scope, handlers, level} = props;

  const name = useMemo(() => {
    return handlers.getName(item, scope);
  }, [handlers.getName, scope]);

  const isSelected = useMemo(() => {
    return Boolean(handlers.isSelected && handlers.isSelected(item, scope));
  }, [handlers.isSelected, scope]);

  const isHighlighted = useMemo(() => {
    return Boolean(handlers.isHighlighted && handlers.isHighlighted(item, scope));
  }, [handlers.isHighlighted, scope]);

  return (
    <S.ItemContainer
      isSelected={isSelected}
      isHighlighted={isHighlighted}
      onClick={() => handlers.onClick && handlers.onClick(item, scope)}
    >
      <S.ItemName level={level} isSelected={isSelected} isHighlighted={isHighlighted}>
        {name}
      </S.ItemName>
    </S.ItemContainer>
  );
}

function NavSectionRenderer<ItemType, ScopeType>(props: {navSection: NavSection<ItemType, ScopeType>; level: number}) {
  const {navSection, level} = props;
  const {name, getItems, getItemsGrouped, useScope, itemHandlers, subsections} = navSection;

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
      if (!itemHandlers) {
        return null;
      }
      return itemHandlers.getIdentifier(item, scope);
    },
    [scope, itemHandlers]
  );

  return (
    <>
      <S.Section.Container isSelected={false} isHighlighted={false}>
        {name}
      </S.Section.Container>
      {itemHandlers &&
        items &&
        items.map(item => (
          <NavSectionItem<ItemType, ScopeType>
            key={getItemIdentifier(item)}
            item={item}
            scope={scope}
            handlers={itemHandlers}
            level={level + 1}
          />
        ))}
      {itemHandlers &&
        groupedItems &&
        Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <React.Fragment key={groupName}>
            <S.Section.Container isSelected={false} isHighlighted={false} style={{color: 'red'}}>
              {groupName}
            </S.Section.Container>
            {groupItems.map(item => (
              <NavSectionItem<ItemType, ScopeType>
                key={getItemIdentifier(item)}
                item={item}
                scope={scope}
                handlers={itemHandlers}
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
