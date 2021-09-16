import React, {useState} from 'react';
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

  const {
    name,
    scope,
    items,
    groupedItems,
    getItemIdentifier,
    isGroupVisible,
    isItemVisible,
    isSectionLoading,
    isSectionVisible,
    itemHandler,
    itemCustomization,
    subsections,
  } = useNavSection<ItemType, ScopeType>(navSection);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!isSectionVisible) {
    return null;
  }

  if (!subsections && Object.keys(groupedItems).length === 0 && items.length === 0) {
    return null;
  }

  if (isSectionLoading) {
    return <S.Skeleton />;
  }

  return (
    <>
      <S.NameContainer
        isHovered={isHovered}
        isSelected={false}
        isHighlighted={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <S.Name isSelected={false} isHighlighted={false} level={level}>
          {name}
        </S.Name>
      </S.NameContainer>
      {itemHandler &&
        Object.keys(groupedItems).length === 0 &&
        items.map(item => (
          <NavSectionItem<ItemType, ScopeType>
            key={getItemIdentifier(item)}
            item={item}
            scope={scope}
            handler={itemHandler}
            customization={itemCustomization}
            level={level + 1}
            isVisible={isItemVisible(item)}
          />
        ))}
      {itemHandler &&
        Object.entries(groupedItems).map(
          ([groupName, groupItems]) =>
            isGroupVisible(groupName) && (
              <React.Fragment key={groupName}>
                <S.NameContainer isSelected={false} isHighlighted={false} style={{color: 'red'}}>
                  <S.Name isSelected={false} isHighlighted={false} level={level + 1}>
                    {groupName}
                  </S.Name>
                </S.NameContainer>
                {groupItems.map(item => (
                  <NavSectionItem<ItemType, ScopeType>
                    key={getItemIdentifier(item)}
                    item={item}
                    scope={scope}
                    handler={itemHandler}
                    customization={itemCustomization}
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
