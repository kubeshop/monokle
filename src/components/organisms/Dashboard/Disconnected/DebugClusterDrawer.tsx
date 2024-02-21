import {useCallback, useEffect, useMemo, useState} from 'react';

import {Button, Drawer} from 'antd';

import {DateTime} from 'luxon';
import styled from 'styled-components';

import {Tooltip} from '@components/atoms/Tooltip/Tooltip';

import {useMainPaneDimensions} from '@utils/hooks';
import {preserveControlCharacters} from '@utils/preserveControlCharacters';

import {ContextId} from '@shared/ipc';
import {Colors} from '@shared/styles';

import {useClusterDebug} from '../useClusterDebug';
import {TextWrapSvg} from './TextWrap';

type Props = {
  contextId: ContextId | undefined;
  open: boolean;
  onClose: () => void;
};

export function DebugClusterDrawer({contextId, open, onClose}: Props) {
  const [wordWrap, setWordWrap] = useState(false);
  const {width} = useMainPaneDimensions();
  const {fetch, status, data} = useClusterDebug(contextId);

  useEffect(() => {
    if (!open) return;
    fetch();
  }, [open, fetch]);

  const toggleWordWrap = useCallback(() => {
    setWordWrap(!wordWrap);
  }, [wordWrap, setWordWrap]);

  const logs = useMemo(() => {
    return [...(data?.logs ?? [])].map(l => ({...l, id: `${l.timestamp}-${l.content}`}));
  }, [data?.logs]);

  return (
    <Drawer
      title="Cluster connection debug logs"
      placement="right"
      onClose={onClose}
      open={open}
      width={width * 0.85}
      bodyStyle={{overflowX: 'auto'}}
      contentWrapperStyle={{overflowX: 'auto'}}
      getContainer={false}
      extra={
        <Tooltip title="Toggle word wrap" placement="bottomLeft" showArrow={false}>
          <HeaderButton onClick={toggleWordWrap} type="link">
            <ButtonBox $wrap={wordWrap}>
              <TextWrapSvg />
            </ButtonBox>
          </HeaderButton>
        </Tooltip>
      }
    >
      {status === 'idle' || status === 'loading' ? (
        <p>loading..</p>
      ) : status === 'error' ? (
        <p>Something went wrong fetching the debug logs.</p>
      ) : (
        <div
          style={{
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
            marginTop: 'auto',
            justifyContent: 'space-between',
          }}
        >
          <div />

          <div style={{paddingBottom: 8}}>
            {logs.map(l => (
              <LogEntry key={l.timestamp}>
                <LogMeta>
                  [{DateTime.fromMillis(l.timestamp).toFormat('HH:MM:ss')} - {l.type}]
                </LogMeta>
                <LogContent $wrap={wordWrap}>{preserveControlCharacters(l.content)}</LogContent>
              </LogEntry>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}

const LogEntry = styled.div`
  display: flex;
`;

const LogMeta = styled.div`
  display: flex;
  color: ${Colors.grey8};
  flex: 0 0 155px;
`;

const LogContent = styled.div<{$wrap: boolean}>`
  white-space: ${({$wrap}) => ($wrap ? 'nowrap' : 'auto')};
  padding-right: 8px;
`;

const HeaderButton = styled(Button)`
  padding: 0;
  width: 24px;
  height: 24px;
`;

const ButtonBox = styled.div<{$wrap: boolean}>`
  color: ${({$wrap}) => ($wrap ? Colors.blue6 : Colors.grey7)};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  background: ${Colors.grey3b};

  :hover {
    background: ${Colors.grey3b};
    color: ${Colors.lightSeaGreen};
  }

  :focus,
  :active {
    background: ${Colors.grey3b};
    color: ${Colors.lightSeaGreen};
  }
`;
