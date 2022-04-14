import React, {useMemo} from 'react';

import {SectionCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';
import {filteredResourceMapSelector} from '@redux/selectors';

import {Icon} from '@components/atoms';

import {isDefined} from '@utils/filter';
import {countResourceErrors, countResourceWarnings} from '@utils/resources';

import * as S from './ResourceKindSectionNameCounter.styled';

function ResourceKindSectionCounter({sectionInstance, onClick}: SectionCustomComponentProps) {
  const {id, isSelected, itemIds} = sectionInstance;
  const isCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(id));
  const filteredResourceMap = useAppSelector(filteredResourceMapSelector);
  const selected = isSelected && isCollapsed;

  const resources = useMemo(() => {
    return itemIds.map(itemId => filteredResourceMap[itemId]).filter(isDefined);
  }, [itemIds, filteredResourceMap]);
  const resourceCount = resources.length;
  const warningCount = useMemo(() => countResourceWarnings(resources), [resources]);
  const errorCount = useMemo(() => countResourceErrors(resources), [resources]);

  return (
    <>
      <S.Counter selected={selected} onClick={onClick}>
        {resourceCount}
      </S.Counter>

      {isCollapsed && warningCount > 0 ? (
        <S.WarningCountContainer selected={selected} $type="warning" onClick={onClick}>
          <Icon name="warning" /> {warningCount}
        </S.WarningCountContainer>
      ) : undefined}

      {isCollapsed && errorCount > 0 ? (
        <S.WarningCountContainer selected={selected} $type="error" onClick={onClick}>
          <Icon name="error" /> {errorCount}
        </S.WarningCountContainer>
      ) : undefined}
    </>
  );
}

export default ResourceKindSectionCounter;
