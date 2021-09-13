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

  const {name, scope, visibleItems, groupedVisibleItems, getItemIdentifier, itemHandler, subsections} = useNavSection<
    ItemType,
    ScopeType
  >(navSection);

  if (!subsections && !groupedVisibleItems && visibleItems.length === 0) {
    return null;
  }

  return (
    <>
      <S.Section.Container isSelected={false} isHighlighted={false}>
        <S.Section.Name isSelected={false} isHighlighted={false} level={level}>
          {name}
        </S.Section.Name>
      </S.Section.Container>
      {itemHandler &&
        visibleItems.map(item => (
          <NavSectionItem<ItemType, ScopeType>
            key={getItemIdentifier(item)}
            item={item}
            scope={scope}
            handler={itemHandler}
            level={level + 1}
          />
        ))}
      {itemHandler &&
        groupedVisibleItems &&
        Object.entries(groupedVisibleItems).map(([groupName, groupItems]) => (
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
        subsections.map(child => (
          <NavSectionRenderer<ItemType, ScopeType> key={child.name} navSection={child} level={level + 1} />
        ))}
    </>
  );
}

export default NavSectionRenderer;
