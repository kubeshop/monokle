import {useState} from 'react';

import {Progress} from 'antd';

import log from 'loglevel';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {NewVersionCode} from '@shared/models/config';

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
      <Progress percent={newVersion.data.percent ?? 0} size="small" />
    </Container>
  );
};

export default DownloadProgress;

const Container = styled.div`
  max-width: 120px;
  min-width: 120px;
`;
