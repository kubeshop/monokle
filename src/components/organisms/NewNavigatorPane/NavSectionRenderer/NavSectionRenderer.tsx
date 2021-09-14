import React from 'react';
import {NavSection} from '@models/navsection';
import {useNavSection} from './useNavSection';
import NavSectionItem from './NavSectionItem';
import * as S from './styled';

type NavSectionRendererProps<ItemType, ScopeType> = {
  navSection: NavSection<ItemType, ScopeType>;
  level: number;
};

function NavSectionRenderer<ItemType, ScopeType>(props: NavSectionRendererProps<ItemType, ScopeType>) {
  const {navSection, level} = props;

  const {name, scope, items, groupedItems, getItemIdentifier, isGroupVisible, isItemVisible, itemHandler, subsections} =
    useNavSection<ItemType, ScopeType>(navSection);

  if (!subsections && !groupedItems && (!items || items.length === 0)) {
    return null;
  }

  return (
    <>
      <S.Section.Container isVisible isSelected={false} isHighlighted={false}>
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
            isVisible={isItemVisible(item)}
          />
        ))}
      {itemHandler &&
        groupedItems &&
        Object.entries(groupedItems).map(
          ([groupName, groupItems]) =>
            isGroupVisible(groupName) && (
              <React.Fragment key={groupName}>
                <S.Section.Container isVisible isSelected={false} isHighlighted={false} style={{color: 'red'}}>
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
                    isVisible={isItemVisible(item)}
                  />
                ))}
              </React.Fragment>
            )
        )}
      {subsections &&
        subsections.map(child => (
          <NavSectionRenderer<ItemType, ScopeType> key={child.name} navSection={child} level={level + 1} />
        ))}
    </>
  );
}

export default NavSectionRenderer;
