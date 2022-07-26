import React from 'react';

import TerminalPane from '../TerminalPane';
import * as S from './BottomPaneManager.styled';

const BottomPaneManager: React.FC = () => {
  return (
    <S.BottomPaneManagerContainer>
      <TerminalPane />
    </S.BottomPaneManagerContainer>
  );
};

export default React.memo(BottomPaneManager);
