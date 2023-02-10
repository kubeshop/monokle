import {useCallback, useMemo, useRef, useState} from 'react';

import {useAppDispatch} from '@redux/hooks';

import {Walkthrough} from '@molecules';

import navSectionMap from '@src/navsections/sectionBlueprintMap';

import {SectionCustomComponent, SectionInstance} from '@shared/models/navigator';

import SectionHeaderDefaultNameCounter from './SectionHeaderDefaultNameCounter';
import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

interface SectionHeaderProps {
  name: string;
  sectionInstance: SectionInstance;
  isCollapsed: boolean;
  isLastSection: boolean;
  level: number;
  indentation: number;
  expandSection: () => void;
  collapseSection: () => void;
}

function SectionHeader(props: SectionHeaderProps) {
  const {name, sectionInstance, isCollapsed, isLastSection, level, indentation, expandSection, collapseSection} = props;
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const sectionBlueprintRef = useRef(navSectionMap.getById(sectionInstance.id));

  const {NameDisplay, NamePrefix, NameSuffix, NameContext, NameCounter} = useSectionCustomization(
    sectionBlueprintRef.current?.customization
  );

  const Counter: SectionCustomComponent = useMemo(
    () => NameCounter.Component ?? SectionHeaderDefaultNameCounter,
    [NameCounter]
  );

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      expandSection();
    } else {
      collapseSection();
    }
  }, [isCollapsed, expandSection, collapseSection]);

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
      hasChildSections={Boolean(
        sectionInstance.visibleChildSectionIds && sectionInstance.visibleChildSectionIds.length > 0
      )}
      disableHoverStyle={Boolean(sectionBlueprintRef.current?.customization?.disableHoverStyle)}
      isSelected={Boolean(sectionInstance.isSelected && isCollapsed)}
      isHighlighted={Boolean(sectionInstance.isHighlighted && isCollapsed)}
      isInitialized={Boolean(sectionInstance.isInitialized)}
      isVisible={Boolean(sectionInstance.isVisible)}
      isSectionCheckable={Boolean(sectionBlueprintRef.current?.builder?.makeCheckable)}
      hasCustomNameDisplay={Boolean(NameDisplay.Component)}
      isLastSection={isLastSection}
      isCollapsed={isCollapsed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <S.NameContainer
        isHovered={isHovered}
        isCheckable={Boolean(sectionBlueprintRef.current?.builder?.makeCheckable)}
        $hasCustomNameDisplay={Boolean(NameDisplay.Component)}
        $indentation={indentation}
      >
        {sectionInstance.checkable &&
          sectionInstance.isInitialized &&
          (sectionBlueprintRef.current?.customization?.isCheckVisibleOnHover
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
            {name === 'K8s Resources' ? (
              <Walkthrough placement="rightTop" step="resource" collection="novice">
                <S.Name
                  $isSelected={sectionInstance.isSelected && isCollapsed}
                  $isHighlighted={sectionInstance.isSelected && isCollapsed}
                  $isCheckable={Boolean(sectionInstance.checkable)}
                  $nameColor={sectionBlueprintRef.current?.customization?.nameColor}
                  $nameSize={sectionBlueprintRef.current?.customization?.nameSize}
                  $nameWeight={sectionBlueprintRef.current?.customization?.nameWeight}
                  $nameVerticalPadding={sectionBlueprintRef.current?.customization?.nameVerticalPadding}
                  $nameHorizontalPadding={sectionBlueprintRef.current?.customization?.nameHorizontalPadding}
                  $level={level}
                  onClick={toggleCollapse}
                >
                  {name}
                </S.Name>
              </Walkthrough>
            ) : (
              <S.Name
                $isSelected={sectionInstance.isSelected && isCollapsed}
                $isHighlighted={sectionInstance.isSelected && isCollapsed}
                $isCheckable={Boolean(sectionInstance.checkable)}
                $nameColor={sectionBlueprintRef.current?.customization?.nameColor}
                $nameSize={sectionBlueprintRef.current?.customization?.nameSize}
                $nameWeight={sectionBlueprintRef.current?.customization?.nameWeight}
                $nameVerticalPadding={sectionBlueprintRef.current?.customization?.nameVerticalPadding}
                $nameHorizontalPadding={sectionBlueprintRef.current?.customization?.nameHorizontalPadding}
                $level={level}
                onClick={toggleCollapse}
              >
                {name}
              </S.Name>
            )}
            <Counter sectionInstance={sectionInstance} onClick={toggleCollapse} />

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
