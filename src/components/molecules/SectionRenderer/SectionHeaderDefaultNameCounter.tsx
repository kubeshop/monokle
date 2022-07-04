import React, {useMemo} from 'react';

import {SectionCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import * as S from './styled';

function SectionHeaderDefaultNameCounter({sectionInstance, onClick}: SectionCustomComponentProps) {
  const {id, isSelected} = sectionInstance;
  const sectionBlueprint = sectionBlueprintMap.getById(id);
  const isCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(id));

  const resourceCount = useMemo(() => {
    const counterType = sectionBlueprint?.customization?.counter?.type;

    if (!counterType || counterType === 'descendants') {
      return sectionInstance?.visibleDescendantItemIds?.length || 0;
    }
    if (counterType === 'items') {
      return sectionInstance?.visibleItemIds.length;
    }
    if (counterType === 'subsections') {
      return sectionInstance?.visibleChildSectionIds?.length || 0;
    }
    return undefined;
  }, [sectionInstance, sectionBlueprint]);

  if (resourceCount === undefined) {
    return null;
  }

  return (
    <S.Counter selected={isSelected && isCollapsed} onClick={onClick}>
      {resourceCount}
    </S.Counter>
  );
}

export default SectionHeaderDefaultNameCounter;
