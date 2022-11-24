import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';
import {filteredResourceMapSelector} from '@redux/selectors';

import {isDefined} from '@utils/filter';
import {countResourceErrors, countResourceWarnings} from '@utils/resources';

import {SectionCustomComponentProps} from '@shared/models/navigator';

import * as S from './ResourceKindSectionNameCounter.styled';

function ResourceKindSectionCounter({sectionInstance, onClick}: SectionCustomComponentProps) {
  const {id, isSelected, itemIds} = sectionInstance;

  const isCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(id));
  const filteredResourceMap = useAppSelector(filteredResourceMapSelector);

  const resources = useMemo(
    () => itemIds.map(itemId => filteredResourceMap[itemId]).filter(isDefined),
    [itemIds, filteredResourceMap]
  );

  const warningCount = useMemo(() => countResourceWarnings(resources), [resources]);
  const errorCount = useMemo(() => countResourceErrors(resources), [resources]);

  return (
    <>
      <S.Counter $isSelected={isSelected} onClick={onClick}>
        {resources.length}
      </S.Counter>

      {isCollapsed && warningCount > 0 ? (
        <span onClick={onClick}>
          <S.Badge $type="warning" count={warningCount} size="small" />
        </span>
      ) : undefined}

      {isCollapsed && errorCount > 0 ? (
        <span onClick={onClick}>
          <S.Badge $type="error" count={errorCount} size="small" />
        </span>
      ) : undefined}
    </>
  );
}

export default ResourceKindSectionCounter;
