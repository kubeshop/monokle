import {Monaco} from '@components/molecules';

import * as S from './EditorTab.styled';

export const EditorTab = () => {
  return (
    <S.Container>
      <Monaco applySelection={() => {}} diffSelectedResource={() => {}} />
    </S.Container>
  );
};
