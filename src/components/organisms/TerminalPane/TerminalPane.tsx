import {useEffect, useRef} from 'react';

import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';

import {useAppDispatch} from '@redux/hooks';
import {setLeftBottomMenuSelection} from '@redux/reducers/ui';

import {Icon, MonoPaneTitle} from '@atoms';

import * as S from './TerminalPane.styled';

const xterm = new Terminal({cursorBlink: true, fontSize: 12});
const fitAddon = new FitAddon();

const TerminalPane: React.FC = () => {
  const dispatch = useAppDispatch();

  const terminalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalContainerRef.current || terminalContainerRef.current.childElementCount !== 0) {
      return;
    }

    xterm.loadAddon(fitAddon);
    xterm.open(terminalContainerRef.current);
    terminalContainerRef.current.focus();
    fitAddon.fit();
  }, []);

  return (
    <S.TerminalPaneContainer>
      <S.TitleBar>
        <S.TitleLabel>
          <Icon name="terminal" />
          <MonoPaneTitle style={{paddingLeft: '10px'}}>Terminal</MonoPaneTitle>
        </S.TitleLabel>

        <S.DownCircleFilled onClick={() => dispatch(setLeftBottomMenuSelection(null))} />
      </S.TitleBar>

      <S.TerminalContainer ref={terminalContainerRef} />
    </S.TerminalPaneContainer>
  );
};

export default TerminalPane;
