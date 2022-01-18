import {useCallback, useMemo, useState} from 'react';

import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';

import {SectionBlueprint, SectionInstance} from '@models/navigator';

import {useAppDispatch} from '@redux/hooks';

import Colors from '@styles/Colors';

import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

interface SectionHeaderProps {
  name: string;
  sectionInstance: SectionInstance;
  sectionBlueprint: SectionBlueprint<any>;
  isCollapsed: boolean;
  isCollapsedMode: 'collapsed' | 'expanded' | 'mixed';
  isLastSection: boolean;
  level: number;
  expandSection: () => void;
  collapseSection: () => void;
}

function SectionHeader(props: SectionHeaderProps) {
  const {
    name,
    sectionInstance,
    sectionBlueprint,
    isCollapsed,
    isLastSection,
    isCollapsedMode,
    level,
    expandSection,
    collapseSection,
  } = props;
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const {NameDisplay, NameSuffix, NameContext} = useSectionCustomization(sectionBlueprint.customization);

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      expandSection();
    } else {
      collapseSection();
    }
  }, [isCollapsed, expandSection, collapseSection]);

  const itemsLength = useMemo(() => {
    return sectionInstance?.visibleDescendantItemIds?.length || 0;
  }, [sectionInstance.visibleDescendantItemIds]);

  const onCheck = useCallback(() => {
    if (!sectionInstance.checkable || !sectionInstance.visibleDescendantItemIds) {
      return;
    }
    if (sectionInstance.checkable.value === 'unchecked' || sectionInstance.checkable.value === 'partial') {
      dispatch(sectionInstance.checkable.checkItemsAction);
      return;
    }
    if (sectionInstance.checkable.value === 'checked') {
      dispatch(sectionInstance.checkable.uncheckItemsAction);
    }
  }, [sectionInstance, dispatch]);

  return (
    <S.SectionContainer
      isHovered={isHovered}
      hasChildSections={Boolean(sectionBlueprint.childSectionIds && sectionBlueprint.childSectionIds.length > 0)}
      disableHoverStyle={Boolean(sectionBlueprint.customization?.disableHoverStyle)}
      isSelected={Boolean(sectionInstance.isSelected && isCollapsed)}
      isHighlighted={Boolean(sectionInstance.isHighlighted && isCollapsed)}
      isInitialized={Boolean(sectionInstance.isInitialized)}
      isVisible={Boolean(sectionInstance.isVisible)}
      isSectionCheckable={Boolean(sectionBlueprint.builder?.makeCheckable)}
      hasCustomNameDisplay={Boolean(NameDisplay.Component)}
      isLastSection={isLastSection}
      isCollapsed={isCollapsed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <S.NameContainer isHovered={isHovered}>
        {sectionInstance.checkable &&
          sectionInstance.isInitialized &&
          (sectionBlueprint.customization?.isCheckVisibleOnHover
            ? sectionInstance.checkable.value === 'partial' ||
              sectionInstance.checkable.value === 'checked' ||
              isHovered
            : true) && (
            <span>
              <S.Checkbox
                checked={sectionInstance.checkable.value === 'checked'}
                indeterminate={sectionInstance.checkable.value === 'partial'}
                onChange={() => onCheck()}
                $level={level}
              />
            </span>
          )}
        {NameDisplay.Component ? (
          <NameDisplay.Component sectionInstance={sectionInstance} />
        ) : (
          <>
            <S.Name
              $isSelected={sectionInstance.isSelected && isCollapsed}
              $isHighlighted={sectionInstance.isSelected && isCollapsed}
              $isCheckable={Boolean(sectionInstance.checkable)}
              $level={level}
              onClick={toggleCollapse}
            >
              {name}
            </S.Name>
            {itemsLength > 0 && (
              <S.ItemsLength selected={sectionInstance.isSelected && isCollapsed}>{itemsLength}</S.ItemsLength>
            )}
            {NameSuffix.Component && NameSuffix.options?.isVisibleOnHover && isHovered && (
              <NameSuffix.Component sectionInstance={sectionInstance} />
            )}
            <S.BlankSpace level={level} onClick={toggleCollapse} />
            {isHovered && sectionInstance.isInitialized && (
              <S.Collapsible>
                {(isCollapsedMode === 'collapsed' || isCollapsedMode === 'mixed') && (
                  <PlusSquareOutlined
                    style={{color: sectionInstance.isSelected ? Colors.blackPure : undefined}}
                    onClick={expandSection}
                  />
                )}
                {(isCollapsedMode === 'expanded' || isCollapsedMode === 'mixed') && (
                  <MinusSquareOutlined onClick={collapseSection} style={{marginLeft: '5px'}} />
                )}
              </S.Collapsible>
            )}
          </>
        )}
      </S.NameContainer>
      <S.NameDisplayContainer>
        {!NameDisplay.Component && NameContext.Component && <NameContext.Component sectionInstance={sectionInstance} />}
      </S.NameDisplayContainer>
    </S.SectionContainer>
  );
}

export default SectionHeader;
