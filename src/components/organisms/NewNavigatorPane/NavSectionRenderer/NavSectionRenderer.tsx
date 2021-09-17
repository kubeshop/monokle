import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';
import {NavSection} from '@models/navsection';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseNavSections, expandNavSections} from '@redux/reducers/ui';
import {useNavSection} from './useNavSection';
import NavSectionItem from './NavSectionItem';
import * as S from './styled';

type NavSectionRendererProps<ItemType, ScopeType> = {
  navSection: NavSection<ItemType, ScopeType>;
  level: number;
};

function loopSubsectionNamesDeep(
  subsections: NavSection<any, any>[] | string[],
  callback: (subsectionName: string) => void
) {
  subsections.forEach(sub => {
    if (typeof sub === 'string') {
      callback(sub);
      return;
    }
    callback(sub.name);
    if (sub.subsectionNames) {
      loopSubsectionNamesDeep(sub.subsectionNames, callback);
    }
  });
}

function NavSectionRenderer<ItemType, ScopeType>(props: NavSectionRendererProps<ItemType, ScopeType>) {
  const dispatch = useAppDispatch();
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
    isSectionHighlighted,
    isSectionSelected,
    itemHandler,
    itemCustomization,
    subsections,
    shouldSectionExpand,
  } = useNavSection<ItemType, ScopeType>(navSection);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const collapsedNavSectionNames = useAppSelector(state => state.ui.navPane.collapsedNavSectionNames);

  const isCollapsedMode = useMemo(() => {
    if (collapsedNavSectionNames.includes(name)) {
      return 'collapsed';
    }
    if (subsections && subsections.every(s => collapsedNavSectionNames.includes(s.name))) {
      return 'collapsed';
    }
    if (subsections && subsections.every(s => !collapsedNavSectionNames.includes(s.name))) {
      return 'expanded';
    }
    if (!subsections || subsections.length === 0) {
      return 'expanded';
    }
    return 'mixed';
  }, [collapsedNavSectionNames, name]);

  const isCollapsed = useMemo(() => {
    return isCollapsedMode === 'collapsed';
  }, [isCollapsedMode]);

  const expandSection = useCallback(() => {
    if (!subsections || subsections.length === 0) {
      dispatch(expandNavSections([name]));
    } else {
      const allSubsectionNames: string[] = [];
      loopSubsectionNamesDeep(subsections, subsectionName => allSubsectionNames.push(subsectionName));
      dispatch(expandNavSections([name, ...allSubsectionNames]));
    }
  }, [name, subsections, dispatch, expandNavSections]);

  const collapseSection = useCallback(() => {
    if (!subsections || subsections.length === 0) {
      dispatch(collapseNavSections([name]));
    } else {
      const allSubsectionNames: string[] = [];
      loopSubsectionNamesDeep(subsections, subsectionName => allSubsectionNames.push(subsectionName));
      dispatch(collapseNavSections([name, ...allSubsectionNames]));
    }
  }, [name, subsections, dispatch, collapseNavSections]);

  useEffect(() => {
    if (shouldSectionExpand) {
      expandSection();
    }
  }, [shouldSectionExpand, expandSection]);

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
        isSelected={isSectionSelected && isCollapsed}
        isHighlighted={isSectionHighlighted && isCollapsed}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <S.Name
          isSelected={isSectionSelected && isCollapsed}
          isHighlighted={isSectionSelected && isCollapsed}
          level={level}
        >
          {name}
        </S.Name>
        {isHovered && (
          <S.Collapsible>
            {(isCollapsedMode === 'collapsed' || isCollapsedMode === 'mixed') && (
              <PlusSquareOutlined onClick={expandSection} />
            )}
            {(isCollapsedMode === 'expanded' || isCollapsedMode === 'mixed') && (
              <MinusSquareOutlined onClick={collapseSection} style={{marginLeft: '5px'}} />
            )}
          </S.Collapsible>
        )}
      </S.NameContainer>
      {!isCollapsed &&
        itemHandler &&
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
      {!isCollapsed &&
        itemHandler &&
        Object.entries(groupedItems).map(
          ([groupName, groupItems]) =>
            isGroupVisible(groupName) && (
              <React.Fragment key={groupName}>
                <S.NameContainer style={{color: 'red'}}>
                  <S.Name level={level + 1}>{groupName}</S.Name>
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
