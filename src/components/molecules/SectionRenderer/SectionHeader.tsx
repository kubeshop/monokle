import {useCallback, useMemo, useState} from 'react';

import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';

import {SectionBlueprint, SectionInstance} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

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

  const {NameDisplay, NameSuffix} = useSectionCustomization(sectionBlueprint.customization);

  const itemInstances = useAppSelector(state =>
    sectionInstance.itemIds.map(itemId => state.navigator.itemInstanceMap[itemId])
  );

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
    if (sectionBlueprint.instanceHandler?.onCheck) {
      sectionBlueprint.instanceHandler.onCheck(sectionInstance, dispatch, itemInstances);
    }
  }, [sectionBlueprint.instanceHandler, sectionInstance, itemInstances, dispatch]);

  return (
    <S.NameContainer
      isHovered={isHovered}
      hasChildSections={Boolean(sectionBlueprint.childSectionIds && sectionBlueprint.childSectionIds.length > 0)}
      disableHoverStyle={Boolean(sectionBlueprint.customization?.disableHoverStyle)}
      isSelected={Boolean(sectionInstance.isSelected && isCollapsed)}
      isHighlighted={Boolean(sectionInstance.isHighlighted && isCollapsed)}
      isInitialized={Boolean(sectionInstance.isInitialized)}
      isVisible={Boolean(sectionInstance.isVisible)}
      isLastSection={isLastSection}
      isCollapsed={isCollapsed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {sectionInstance.isCheckable &&
        (sectionBlueprint.customization?.isCheckVisibleOnHover ? sectionInstance.isChecked || isHovered : true) && (
          <span>
            <S.Checkbox
              checked={sectionInstance.isChecked === true}
              indeterminate={sectionInstance.isChecked === 'partial'}
              onChange={() => onCheck()}
              $level={level}
            />
          </span>
        )}
      {sectionInstance.isCheckable &&
        sectionBlueprint.customization?.isCheckVisibleOnHover &&
        !sectionInstance.isChecked &&
        !isHovered && <S.CheckboxPlaceholder $level={level} />}
      {NameDisplay.Component ? (
        <NameDisplay.Component sectionInstance={sectionInstance} />
      ) : (
        <>
          <S.Name
            $isSelected={sectionInstance.isSelected && isCollapsed}
            $isHighlighted={sectionInstance.isSelected && isCollapsed}
            $isCheckable={Boolean(sectionInstance.isCheckable)}
            $level={level}
          >
            <span style={{cursor: 'pointer'}} onClick={toggleCollapse}>
              {name}
            </span>
            {itemsLength > 0 && (
              <S.ItemsLength selected={sectionInstance.isSelected && isCollapsed}>{itemsLength}</S.ItemsLength>
            )}
            {NameSuffix.Component && (NameSuffix.options?.isVisibleOnHover ? isHovered : true) && (
              <NameSuffix.Component sectionInstance={sectionInstance} />
            )}
          </S.Name>
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
  );
}

export default SectionHeader;
