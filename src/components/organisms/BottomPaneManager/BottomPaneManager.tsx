import React, {Suspense} from 'react';

import {useAppSelector} from '@redux/hooks';

import * as S from './BottomPaneManager.styled';

const TerminalPane = React.lazy(() => import('@organisms/TerminalPane'));

const BottomPaneManager: React.FC = () => {
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  return (
    <S.BottomPaneManagerContainer>
      <Suspense fallback={null}>{bottomSelection === 'terminal' && <TerminalPane />}</Suspense>
    </S.BottomPaneManagerContainer>
  );
};

export default BottomPaneManager;
