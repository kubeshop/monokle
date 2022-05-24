import {useMemo} from 'react';

import {SectionCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';
import {filteredResourceMapSelector} from '@redux/selectors';

import {isDefined} from '@utils/filter';
import {countResourceErrors, countResourceWarnings} from '@utils/resources';

import * as S from './ResourceKindSectionNameCounter.styled';

function ResourceKindSectionCounter({sectionInstance, onClick}: SectionCustomComponentProps) {
  const {id, itemIds} = sectionInstance;
  const isCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(id));
  const filteredResourceMap = useAppSelector(filteredResourceMapSelector);

  const resources = useMemo(() => {
    return itemIds.map(itemId => filteredResourceMap[itemId]).filter(isDefined);
  }, [itemIds, filteredResourceMap]);
  const resourceCount = resources.length;
  const warningCount = useMemo(() => countResourceWarnings(resources), [resources]);
  const errorCount = useMemo(() => countResourceErrors(resources), [resources]);

  return (
    <>
      <S.Counter onClick={onClick}>{resourceCount}</S.Counter>

      {isCollapsed && warningCount > 0 ? <S.Badge $type="warning" count={warningCount} size="small" /> : undefined}

      {isCollapsed && errorCount > 0 ? <S.Badge $type="error" count={errorCount} size="small" /> : undefined}
    </>
  );
}

export default ResourceKindSectionCounter;
