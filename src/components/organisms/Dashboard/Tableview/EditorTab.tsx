import {useAppSelector} from '@redux/hooks';

import {Monaco} from '@components/molecules';

import * as S from './EditorTab.styled';

export const EditorTab = () => {
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);

  return (
    <S.Container>
      <Monaco resourceID={selectedResourceId} applySelection={() => {}} diffSelectedResource={() => {}} />
    </S.Container>
  );
};
