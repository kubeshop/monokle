import {useCallback, useMemo, useState} from 'react';

import {SectionCustomComponent} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import WalkThrough from '@components/molecules/WalkThrough';

import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import SectionHeaderDefaultNameCounter from './SectionHeaderDefaultNameCounter';
import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

interface SectionHeaderProps {
  sectionId: string;
  // sectionInstance: SectionInstance;
  // sectionBlueprint: SectionBlueprint<any>;
  isCollapsed: boolean;
  isLastSection: boolean;
  level: number;
  indentation: number;
  expandSection: () => void;
  collapseSection: () => void;
}

function SectionHeader(props: SectionHeaderProps) {
  const {sectionId, isCollapsed, isLastSection, level, indentation, expandSection, collapseSection} = props;
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const sectionBlueprint = useMemo(() => sectionBlueprintMap.getById(sectionId), [sectionId]);
  const sectionInstance = useAppSelector(state => state.navigator.sectionInstanceMap[sectionId]);

  const {NameDisplay, NamePrefix, NameSuffix, NameContext, NameCounter} = useSectionCustomization(
    sectionBlueprint?.customization
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

  if (!sectionBlueprint) {
    return null;
  }

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
            {sectionInstance.name === 'K8s Resources' ? (
              <WalkThrough placement="rightTop" step="resource" collection="novice">
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
                  {sectionInstance.name}
                </S.Name>
              </WalkThrough>
            ) : (
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
                {sectionInstance.name}
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
