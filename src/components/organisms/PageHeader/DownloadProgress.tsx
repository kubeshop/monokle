import {useState} from 'react';

import {Progress} from 'antd';

import log from 'loglevel';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {NewVersionCode} from '@shared/models/config';
import {Colors} from '@shared/styles/colors';

declare global {
  interface Window {
    debug_update: Function;
  }
}

const DownloadProgress: React.FC = () => {
  const newVersion = useAppSelector(state => state.config.newVersion);
  const [showDownloadProgress, setShowDownloadProgress] = useState(false);

  window.debug_update = (value: boolean) => {
    if (value) {
      log.info('Download progress debug activated!');
      setShowDownloadProgress(true);
    } else {
      log.info('Download progress debug deactivated!');
      setShowDownloadProgress(false);
    }
  };

  if (newVersion.code !== NewVersionCode.Downloading || !newVersion.data.percent || !showDownloadProgress) {
    return null;
  }

  return (
    <Container>
      <Progress
        strokeColor={{
          '0%': '#84AAE2',
          '90%': '#9C84E2',
          '100%': '#CD92F1',
        }}
        format={percent => <DownloadingText>Downloading new version {percent}%</DownloadingText>}
        percent={newVersion.data.percent ?? 99}
        size="small"
      />
    </Container>
  );
};

export default DownloadProgress;

const Container = styled.div`
  max-width: 120px;
  min-width: 120px;
`;

const DownloadingText = styled.span`
  color: ${Colors.grey7};
  font-size: 11px;
`;
