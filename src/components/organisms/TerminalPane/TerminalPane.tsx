import {useAppDispatch} from '@redux/hooks';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {Icon, MonoPaneTitle} from '@atoms';

import * as S from './TerminalPane.styled';

const TerminalPane: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <S.TerminalPaneContainer>
      <S.TitleBar>
        <S.TitleLabel>
          <Icon name="terminal" />
          <MonoPaneTitle style={{paddingLeft: '10px'}}>Terminal</MonoPaneTitle>
        </S.TitleLabel>

        <S.DownCircleFilled onClick={() => dispatch(setLeftBottomMenuSelection(null))} />
      </S.TitleBar>
    </S.TerminalPaneContainer>
  );
};

export default TerminalPane;
