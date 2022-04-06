import React, {useMemo} from 'react';

import {SectionCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import * as S from './styled';

function SectionHeaderDefaultNameCounter({sectionInstance, sectionBlueprint}: SectionCustomComponentProps) {
  const {id, isSelected} = sectionInstance;
  const isCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(id));

  const resourceCount = useMemo(() => {
    const counterDisplayMode = sectionBlueprint?.customization?.counterDisplayMode;

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

  if (resourceCount === undefined) {
    return null;
  }

  return (
    <S.Counter selected={isSelected && isCollapsed}>
      {resourceCount}
    </S.Counter>
  );
}

export default SectionHeaderDefaultNameCounter;
