import {useCallback, useMemo, useState} from 'react';

import {SectionCustomComponent} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseSectionIds, expandSectionIds} from '@redux/reducers/navigator';

import WalkThrough from '@components/molecules/WalkThrough';

import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import SectionHeaderDefaultNameCounter from './SectionHeaderDefaultNameCounter';
import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

interface SectionHeaderProps {
  sectionId: string;
  isLastSection: boolean; // TODO: this should be on the SectionInstance
}

function SectionHeader(props: SectionHeaderProps) {
  const {sectionId, isLastSection} = props;
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

  const expandSection = useCallback(() => {
    if (!sectionInstance?.id) {
      return;
    }
    if (!sectionInstance?.visibleDescendantSectionIds || sectionInstance.visibleDescendantSectionIds.length === 0) {
      dispatch(expandSectionIds([sectionInstance.id]));
    } else {
      dispatch(expandSectionIds([sectionInstance.id, ...sectionInstance.visibleDescendantSectionIds]));
    }
  }, [sectionInstance?.id, sectionInstance?.visibleDescendantSectionIds, dispatch]);

  const collapseSection = useCallback(() => {
    if (!sectionInstance?.id) {
      return;
    }
    if (!sectionInstance?.visibleDescendantSectionIds || sectionInstance.visibleDescendantSectionIds.length === 0) {
      dispatch(collapseSectionIds([sectionInstance?.id]));
    } else {
      dispatch(collapseSectionIds([sectionInstance?.id, ...sectionInstance.visibleDescendantSectionIds]));
    }
  }, [sectionInstance?.id, sectionInstance?.visibleDescendantSectionIds, dispatch]);

  const toggleCollapse = useCallback(() => {
    if (sectionInstance.isCollapsed) {
      expandSection();
    } else {
      collapseSection();
    }
  }, [expandSection, collapseSection, sectionInstance.isCollapsed]);

  if (!sectionBlueprint) {
    return null;
  }

  return (
    <S.SectionContainer
      isHovered={isHovered}
      hasChildSections={Boolean(sectionBlueprint.childSectionIds && sectionBlueprint.childSectionIds.length > 0)}
      disableHoverStyle={Boolean(sectionBlueprint.customization?.disableHoverStyle)}
      isSelected={Boolean(sectionInstance.isSelected && sectionInstance.isCollapsed)}
      isHighlighted={Boolean(sectionInstance.isHighlighted && sectionInstance.isCollapsed)}
      isInitialized={Boolean(sectionInstance.isInitialized)}
      isVisible={Boolean(sectionInstance.isVisible)}
      isSectionCheckable={Boolean(sectionBlueprint.builder?.makeCheckable)}
      hasCustomNameDisplay={Boolean(NameDisplay.Component)}
      isLastSection={isLastSection}
      isCollapsed={sectionInstance.isCollapsed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <S.NameContainer
        isHovered={isHovered}
        isCheckable={Boolean(sectionBlueprint.builder?.makeCheckable)}
        $hasCustomNameDisplay={Boolean(NameDisplay.Component)}
        $indentation={0} // TODO: indentation should be set on the SectionInstance
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
                  $isSelected={sectionInstance.isSelected && sectionInstance.isCollapsed}
                  $isHighlighted={sectionInstance.isSelected && sectionInstance.isCollapsed}
                  $isCheckable={Boolean(sectionInstance.checkable)}
                  $nameColor={sectionBlueprint.customization?.nameColor}
                  $nameSize={sectionBlueprint.rowFontSize || (sectionBlueprint.rowHeight || 50) / 2}
                  $nameWeight={sectionBlueprint.customization?.nameWeight}
                  $nameVerticalPadding={sectionBlueprint.customization?.nameVerticalPadding}
                  $nameHorizontalPadding={sectionBlueprint.customization?.nameHorizontalPadding}
                  onClick={toggleCollapse}
                >
                  {sectionInstance.name}
                </S.Name>
              </WalkThrough>
            ) : (
              <S.Name
                $isSelected={sectionInstance.isSelected && sectionInstance.isCollapsed}
                $isHighlighted={sectionInstance.isSelected && sectionInstance.isCollapsed}
                $isCheckable={Boolean(sectionInstance.checkable)}
                $nameColor={sectionBlueprint.customization?.nameColor}
                $nameSize={sectionBlueprint.rowFontSize || (sectionBlueprint.rowHeight || 50) / 2}
                $nameWeight={sectionBlueprint.customization?.nameWeight}
                $nameVerticalPadding={sectionBlueprint.customization?.nameVerticalPadding}
                $nameHorizontalPadding={sectionBlueprint.customization?.nameHorizontalPadding}
                onClick={toggleCollapse}
              >
                {sectionInstance.name}
              </S.Name>
            )}
            <Counter sectionInstance={sectionInstance} onClick={toggleCollapse} />

            <S.BlankSpace $height={sectionBlueprint.rowHeight || 50} onClick={toggleCollapse} />

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
