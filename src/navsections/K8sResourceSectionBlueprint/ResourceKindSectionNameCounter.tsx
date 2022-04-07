import React, {useMemo} from 'react';

import {SectionCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import {isDefined} from '@utils/filter';
import {countResourceErrors, countResourceWarnings} from '@utils/resources';

import * as S from '../../components/molecules/SectionRenderer/styled';
import * as WarningStyle from '../../components/organisms/NavigatorPane/WarningAndErrorsDisplay.styled';

function ResourceKindSectionCounter({sectionInstance, onClick}: SectionCustomComponentProps) {
  const {id, isSelected, itemIds} = sectionInstance;
  const isCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(id));
  const resources = useAppSelector(state => itemIds.map(itemId => state.main.resourceMap[itemId]).filter(isDefined));

  const resourceCount = resources.length;
  const warningCount = useMemo(() => countResourceWarnings(resources), [resources]);
  const errorCount = useMemo(() => countResourceErrors(resources), [resources]);

  return (
    <>
      <S.Counter selected={isSelected && isCollapsed} onClick={onClick}>
        {resourceCount}
      </S.Counter>

      {isCollapsed && warningCount > 0 ? (
        <WarningStyle.WarningCountContainer $type="warning" onClick={onClick}>
          <WarningStyle.Icon $type="warning" name="warning" /> {warningCount}
        </WarningStyle.WarningCountContainer>
      ) : undefined}

      {isCollapsed && errorCount > 0 ? (
        <WarningStyle.WarningCountContainer $type="error" onClick={onClick}>
          <WarningStyle.Icon $type="error" name="error" /> {errorCount}
        </WarningStyle.WarningCountContainer>
      ) : undefined}
    </>
  );
}

export default ResourceKindSectionCounter;
