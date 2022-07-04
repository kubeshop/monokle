import {useCallback, useMemo, useState} from 'react';

import {NavigatorSectionRow, SectionCustomComponent} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseSectionIds, expandSectionIds} from '@redux/reducers/navigator';

import WalkThrough from '@components/molecules/WalkThrough';

import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import SectionHeaderDefaultNameCounter from './SectionHeaderDefaultNameCounter';
import {useSectionCustomization} from './useSectionCustomization';

import * as S from './styled';

interface SectionHeaderProps {
  sectionRow: NavigatorSectionRow;
}

function SectionHeader(props: SectionHeaderProps) {
  const {sectionRow} = props;
  const sectionId = sectionRow.id;
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const sectionBlueprint = useMemo(() => sectionBlueprintMap.getById(sectionId), [sectionId]);
  const sectionInstance = useAppSelector(state => state.navigator.sectionInstanceMap[sectionId]);

  const {customRow, customPrefix, customSuffix, customContextMenu, customCounter} = useSectionCustomization(
    sectionBlueprint?.customization
  );

  const Counter: SectionCustomComponent = useMemo(
    () => customCounter.Component ?? SectionHeaderDefaultNameCounter,
    [customCounter]
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
      $isHovered={isHovered}
      $disableHoverStyle={Boolean(sectionBlueprint.customization?.row?.disableHoverStyle)}
      $isSelected={Boolean(sectionInstance.isSelected && sectionInstance.isCollapsed)}
      $isHighlighted={Boolean(sectionInstance.isHighlighted && sectionInstance.isCollapsed)}
      $isInitialized={Boolean(sectionInstance.isInitialized)}
      $isSectionCheckable={Boolean(sectionBlueprint.builder?.makeCheckable)}
      $hasCustomRow={Boolean(customRow.Component)}
      $marginBottom={sectionRow.marginBottom}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <S.NameContainer
        $isHovered={isHovered}
        $isCheckable={Boolean(sectionBlueprint.builder?.makeCheckable)}
        $hasCustomRow={Boolean(customRow.Component)}
        $indentation={sectionRow.indentation}
      >
        {sectionInstance.checkable &&
          sectionInstance.isInitialized &&
          (sectionBlueprint.customization?.checkbox?.isVisibleOnHover
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
        {customRow.Component ? (
          <customRow.Component sectionInstance={sectionInstance} onClick={toggleCollapse} />
        ) : (
          <>
            {customPrefix.Component && (
              <customPrefix.Component sectionInstance={sectionInstance} onClick={toggleCollapse} />
            )}
            {sectionInstance.name === 'K8s Resources' ? (
              <WalkThrough placement="rightTop" step="resource" collection="novice">
                <S.Name
                  $isSelected={sectionInstance.isSelected && sectionInstance.isCollapsed}
                  $isHighlighted={sectionInstance.isSelected && sectionInstance.isCollapsed}
                  $isCheckable={Boolean(sectionInstance.checkable)}
                  $fontSize={sectionRow.fontSize}
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
                $fontSize={sectionRow.fontSize}
                onClick={toggleCollapse}
              >
                {sectionInstance.name}
              </S.Name>
            )}
            <Counter sectionInstance={sectionInstance} onClick={toggleCollapse} />

            <S.BlankSpace $height={sectionRow.height} onClick={toggleCollapse} />

            {customSuffix.Component &&
              (sectionBlueprint.customization?.suffix?.isVisibleOnHover ? isHovered : true) && (
                <customSuffix.Component sectionInstance={sectionInstance} onClick={toggleCollapse} />
              )}
          </>
        )}
      </S.NameContainer>
      <S.CustomContextMenuContainer>
        {!customRow.Component && customContextMenu.Component && (
          <customContextMenu.Component sectionInstance={sectionInstance} onClick={toggleCollapse} />
        )}
      </S.CustomContextMenuContainer>
    </S.SectionContainer>
  );
}

export default SectionHeader;
