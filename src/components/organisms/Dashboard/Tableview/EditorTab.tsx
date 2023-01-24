import {useAppSelector} from '@redux/hooks';

import {Monaco} from '@components/molecules';

import * as S from './EditorTab.styled';

export const EditorTab = () => {
  const resourceSelection = useAppSelector(state => state.dashboard.tableDrawer.resourceSelection);

  return (
    <S.Container>
      <Monaco providedResourceSelection={resourceSelection} applySelection={() => {}} diffSelectedResource={() => {}} />
    </S.Container>
  );
};
