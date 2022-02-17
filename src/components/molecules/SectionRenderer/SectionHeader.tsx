import {useCallback, useMemo, useState} from 'react';

import {SectionBlueprint, SectionInstance} from '@models/navigator';

import {useAppDispatch} from '@redux/hooks';

import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

interface SectionHeaderProps {
  name: string;
  sectionInstance: SectionInstance;
  sectionBlueprint: SectionBlueprint<any>;
  isCollapsed: boolean;
  isLastSection: boolean;
  level: number;
  indentation: number;
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
    level,
    indentation,
    expandSection,
    collapseSection,
  } = props;
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const {NameDisplay, NamePrefix, NameSuffix, NameContext} = useSectionCustomization(sectionBlueprint.customization);

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      expandSection();
    } else {
      collapseSection();
    }
  }, [isCollapsed, expandSection, collapseSection]);

  const counter = useMemo(() => {
    const counterDisplayMode = sectionBlueprint.customization?.counterDisplayMode;
    if (!counterDisplayMode || counterDisplayMode === 'descendants') {
      return sectionInstance?.visibleDescendantItemIds?.length || 0;
    }
    if (counterDisplayMode === 'items') {
      return sectionInstance?.visibleItemIds.length;
    }
    if (counterDisplayMode === 'subsections') {
      return sectionInstance?.visibleChildSectionIds?.length || 0;
    }
    return undefined;
  }, [sectionInstance, sectionBlueprint]);

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
      <S.NameContainer
        isHovered={isHovered}
        isCheckable={Boolean(sectionBlueprint.builder?.makeCheckable)}
        $hasCustomNameDisplay={Boolean(NameDisplay.Component)}
        $indentation={indentation}
      >
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
          <NameDisplay.Component sectionInstance={sectionInstance} onClick={toggleCollapse} />
        ) : (
          <>
            {NamePrefix.Component && (
              <NamePrefix.Component sectionInstance={sectionInstance} onClick={toggleCollapse} />
            )}
            <S.Name
              $isSelected={sectionInstance.isSelected && isCollapsed}
              $isHighlighted={sectionInstance.isSelected && isCollapsed}
              $isCheckable={Boolean(sectionInstance.checkable)}
              $nameColor={sectionBlueprint.customization?.nameColor}
              $nameSize={sectionBlueprint.customization?.nameSize}
              $nameWeight={sectionBlueprint.customization?.nameWeight}
              $nameVerticalPadding={sectionBlueprint.customization?.nameVerticalPadding}
              $nameHorizontalPadding={sectionBlueprint.customization?.nameHorizontalPadding}
              $level={level}
              onClick={toggleCollapse}
            >
              {name}
            </S.Name>
            {counter && <S.Counter selected={sectionInstance.isSelected && isCollapsed}>{counter}</S.Counter>}
            <S.BlankSpace level={level} onClick={toggleCollapse} />
            {NameSuffix.Component && (NameSuffix.options?.isVisibleOnHover ? isHovered : true) && (
              <NameSuffix.Component sectionInstance={sectionInstance} onClick={toggleCollapse} />
            )}
          </>
        )}
      </S.NameContainer>
      <S.NameDisplayContainer>
        {!NameDisplay.Component && NameContext.Component && (
          <NameContext.Component sectionInstance={sectionInstance} onClick={toggleCollapse} />
        )}
      </S.NameDisplayContainer>
    </S.SectionContainer>
  );
}

export default SectionHeader;
