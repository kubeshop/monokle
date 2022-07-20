import React from 'react';

import {useAppSelector} from '@redux/hooks';

import * as S from './BottomPaneManager.styled';

const TerminalPane = React.lazy(() => import('@organisms/TerminalPane'));

const BottomPaneManager: React.FC = () => {
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const bottomPaneHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);

  return (
    <S.BottomPaneManagerContainer $height={bottomPaneHeight}>
      {bottomSelection === 'terminal' && <TerminalPane />}
    </S.BottomPaneManagerContainer>
  );
};

export default BottomPaneManager;
