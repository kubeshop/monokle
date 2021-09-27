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
  isLastSection: boolean;
  onVisible: (sectionName: string) => void;
  onHidden: (sectionName: string) => void;
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

function NavSectionHeader(props: {
  name: string;
  isSectionSelected: boolean;
  isCollapsed: boolean;
  isSectionHighlighted: boolean;
  isLastSection: boolean;
  hasSubsections: boolean;
  isSectionInitialized: boolean;
  isSectionVisible: boolean;
  isCollapsedMode: 'collapsed' | 'expanded' | 'mixed';
  level: number;
  expandSection: () => void;
  collapseSection: () => void;
}) {
  const {
    name,
    isSectionSelected,
    isCollapsed,
    isSectionHighlighted,
    isLastSection,
    hasSubsections,
    isSectionInitialized,
    isSectionVisible,
    isCollapsedMode,
    level,
    expandSection,
    collapseSection,
  } = props;
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <S.NameContainer
      isHovered={isHovered}
      isSelected={isSectionSelected && isCollapsed}
      isHighlighted={isSectionHighlighted && isCollapsed}
      isLastSection={isLastSection}
      hasSubsections={hasSubsections}
      isCollapsed={isCollapsed}
      isInitialized={isSectionInitialized}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      isVisible={isSectionVisible}
    >
      <S.Name
        isSelected={isSectionSelected && isCollapsed}
        isHighlighted={isSectionSelected && isCollapsed}
        level={level}
      >
        {name}
      </S.Name>
      {isHovered && isSectionInitialized && (
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
  );
}

function NavSectionRenderer<ItemType, ScopeType>(props: NavSectionRendererProps<ItemType, ScopeType>) {
  const dispatch = useAppDispatch();
  const {navSection, level, isLastSection, onVisible, onHidden} = props;
  const [hiddenSubsectionNames, setHiddenSubsectionNames] = useState<string[]>([]);
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
    isSectionInitialized,
    itemHandler,
    itemCustomization,
    subsections,
    shouldSectionExpand,
  } = useNavSection<ItemType, ScopeType>(navSection, hiddenSubsectionNames);

  const collapsedNavSectionNames = useAppSelector(state => state.ui.navPane.collapsedNavSectionNames);

  const allVisibileNestedSubsectionNames = useMemo(() => {
    if (!subsections) {
      return undefined;
    }
    const nestedSubsectionNames: string[] = [];
    loopSubsectionNamesDeep(subsections, subsectionName => nestedSubsectionNames.push(subsectionName));
    return nestedSubsectionNames.filter(n => !hiddenSubsectionNames.includes(n));
  }, [subsections, hiddenSubsectionNames]);

  const isCollapsedMode = useMemo(() => {
    if (allVisibileNestedSubsectionNames) {
      if (
        collapsedNavSectionNames.includes(name) &&
        allVisibileNestedSubsectionNames.every(s => collapsedNavSectionNames.includes(s))
      ) {
        return 'collapsed';
      }
      if (
        !collapsedNavSectionNames.includes(name) &&
        allVisibileNestedSubsectionNames.every(s => !collapsedNavSectionNames.includes(s))
      ) {
        return 'expanded';
      }
      return 'mixed';
    }
    if (collapsedNavSectionNames.includes(name)) {
      return 'collapsed';
    }
    return 'expanded';
  }, [collapsedNavSectionNames, name, allVisibileNestedSubsectionNames]);

  const isCollapsed = useMemo(() => {
    return isCollapsedMode === 'collapsed';
  }, [isCollapsedMode]);

  const expandSection = useCallback(() => {
    if (!allVisibileNestedSubsectionNames || allVisibileNestedSubsectionNames.length === 0) {
      dispatch(expandNavSections([name]));
    } else {
      dispatch(expandNavSections([name, ...allVisibileNestedSubsectionNames]));
    }
  }, [name, allVisibileNestedSubsectionNames, dispatch, expandNavSections]);

  const collapseSection = useCallback(() => {
    if (!allVisibileNestedSubsectionNames || allVisibileNestedSubsectionNames.length === 0) {
      dispatch(collapseNavSections([name]));
    } else {
      dispatch(collapseNavSections([name, ...allVisibileNestedSubsectionNames]));
    }
  }, [name, allVisibileNestedSubsectionNames, dispatch, collapseNavSections]);

  useEffect(() => {
    if (shouldSectionExpand) {
      expandSection();
    }
  }, [shouldSectionExpand, expandSection]);

  const onSubsectionVisible = useCallback(
    (subsectionName: string) => {
      if (hiddenSubsectionNames.includes(subsectionName)) {
        setHiddenSubsectionNames(prevHiddenSubsections => prevHiddenSubsections.filter(s => s !== subsectionName));
      }
    },
    [hiddenSubsectionNames, setHiddenSubsectionNames]
  );

  const onSubsectionHidden = useCallback(
    (subsectionName: string) => {
      if (!hiddenSubsectionNames.includes(subsectionName)) {
        setHiddenSubsectionNames(prevHiddenSubsections => [...prevHiddenSubsections, subsectionName]);
      }
    },
    [hiddenSubsectionNames, setHiddenSubsectionNames]
  );

  useEffect(() => {
    if (isSectionVisible) {
      onVisible(name);
    } else {
      onHidden(name);
    }
  }, [isSectionVisible]);

  useEffect(() => {
    subsections?.forEach(subsection => {
      if (hiddenSubsectionNames.includes(subsection.name)) {
        onHidden(subsection.name);
      } else {
        onVisible(subsection.name);
      }
    });
  }, [subsections, hiddenSubsectionNames]);

  const visibleSubsections = useMemo(
    () => subsections?.filter(s => !hiddenSubsectionNames.includes(s.name)),
    [subsections, hiddenSubsectionNames]
  );

  const visibleItems = useMemo(() => {
    return items.filter(i => isItemVisible(i));
  }, [items, isItemVisible]);

  const isLastVisibleItem = useCallback(
    (item: ItemType) => {
      const lastVisibleItem = visibleItems[visibleItems.length - 1];
      return Boolean(lastVisibleItem && getItemIdentifier(lastVisibleItem) === getItemIdentifier(item));
    },
    [visibleItems, getItemIdentifier]
  );

  const isLastVisibleGroupedItem = useCallback(
    (groupKey: string, item: ItemType) => {
      const groupVisibleItems = groupedItems[groupKey].filter(i => isItemVisible(i));
      const lastVisibleItem = groupVisibleItems[groupVisibleItems.length - 1];
      return Boolean(lastVisibleItem && getItemIdentifier(lastVisibleItem) === getItemIdentifier(item));
    },
    [groupedItems, getItemIdentifier]
  );

  const isLastVisibleSection = useCallback(
    (subsectionName: string) => {
      const lastVisibleSection = visibleSubsections ? visibleSubsections[visibleSubsections.length - 1] : undefined;
      return Boolean(lastVisibleSection && lastVisibleSection.name === subsectionName);
    },
    [visibleSubsections, getItemIdentifier]
  );

  if (isSectionLoading) {
    return <S.Skeleton />;
  }

  return (
    <>
      <NavSectionHeader
        name={name}
        isSectionSelected={isSectionSelected}
        isCollapsed={isCollapsed}
        isSectionHighlighted={isSectionHighlighted}
        isLastSection={isLastSection}
        hasSubsections={Boolean(subsections && subsections.length > 0)}
        isSectionInitialized={isSectionInitialized}
        isSectionVisible={isSectionVisible}
        isCollapsedMode={isCollapsedMode}
        level={level}
        expandSection={expandSection}
        collapseSection={collapseSection}
      />
      {!isCollapsed &&
        isSectionVisible &&
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
            isLastItem={isLastVisibleItem(item)}
          />
        ))}
      {!isCollapsed &&
        isSectionVisible &&
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
                    isLastItem={isLastVisibleGroupedItem(groupName, item)}
                  />
                ))}
              </React.Fragment>
            )
        )}
      {subsections &&
        subsections.map(child => (
          <NavSectionRenderer<ItemType, ScopeType>
            key={child.name}
            navSection={child}
            level={level + 1}
            isLastSection={isLastVisibleSection(child.name)}
            onVisible={onSubsectionVisible}
            onHidden={onSubsectionHidden}
          />
        ))}
    </>
  );
}

export default NavSectionRenderer;
