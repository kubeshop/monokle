import React, {useMemo} from 'react';

import {SectionCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import {countResourceErrors, countResourceWarnings} from '@utils/resources';

import * as S from '../../components/molecules/SectionRenderer/styled';
import * as WarningStyle from '../../components/organisms/NavigatorPane/WarningAndErrorsDisplay.styled';

function ResourceKindSectionCounter({sectionInstance, onClick}: SectionCustomComponentProps) {
  const {id, isSelected, itemIds} = sectionInstance;
  const isCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(id));
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const resources = useMemo(() => itemIds.map(itemId => resourceMap[itemId]), [itemIds, resourceMap]);

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
