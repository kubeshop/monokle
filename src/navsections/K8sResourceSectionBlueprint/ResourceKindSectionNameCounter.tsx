import React, {useMemo} from 'react';

import {SectionCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import {Icon} from '@components/atoms';

import {isDefined} from '@utils/filter';
import {countResourceErrors, countResourceWarnings} from '@utils/resources';

import * as S from './ResourceKindSectionNameCounter.styled';

function ResourceKindSectionCounter({sectionInstance, onClick}: SectionCustomComponentProps) {
  const {id, isSelected, itemIds} = sectionInstance;
  const isCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(id));
  const resources = useAppSelector(state => itemIds.map(itemId => state.main.resourceMap[itemId]).filter(isDefined));
  const selected = isSelected && isCollapsed;

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
