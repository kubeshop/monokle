import {useAppSelector} from '@redux/hooks';

import * as S from './BottomPaneManager.styled';

const BottomPaneManager: React.FC = () => {
  const bottomPaneHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);

  return <S.BottomPaneManagerContainer $height={bottomPaneHeight}>Test</S.BottomPaneManagerContainer>;
};

export default BottomPaneManager;
