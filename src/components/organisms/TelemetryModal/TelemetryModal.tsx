import React, {useState} from 'react';

import {Button, Modal} from 'antd';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {updateTelemetry} from '@redux/reducers/appConfig';

import {Telemetry} from '@organisms/SettingsManager';

import electronStore from '@utils/electronStore';

import * as S from './styled';

const StyledModal = styled(Modal)`
  .ant-modal {
    z-index: 1001;
  }
`;

const TelemetryModal = () => {
  const dispatch = useAppDispatch();
  const disableEventTracking = electronStore.get('appConfig.disableEventTracking');
  const disableErrorReporting = electronStore.get('appConfig.disableErrorReporting');

  const isModalVisible = disableEventTracking === undefined || disableErrorReporting === undefined;
  const [disableEventTrackingLocal, setDisableEventTrackingLocal] = useState<boolean>(false);
  const [disableErrorReportingLocal, setDisableErrorReportingLocal] = useState<boolean>(false);

  const handleClose = () => {
    dispatch(
      updateTelemetry({
        disableEventTracking: disableEventTrackingLocal,
        disableErrorReporting: disableErrorReportingLocal,
      })
    );
  };

  return (
    <StyledModal
      visible={isModalVisible}
      title="Monokle telemetry data"
      centered
      width={400}
      onCancel={handleClose}
      footer={
        <Button style={{width: 72}} type="primary" onClick={handleClose}>
          Done
        </Button>
      }
    >
      <div id="TelemetryModal">
        <S.TextContainer>
          Monokle would like your permission to track usage and error reports, more details can be found{' '}
          <a href="https://github.com/kubeshop/monokle/blob/main/docs/telemetry.md">here</a>
        </S.TextContainer>
        <Telemetry
          disableEventTracking={disableEventTrackingLocal}
          disableErrorReporting={disableErrorReportingLocal}
          handleToggleEventTracking={() => setDisableEventTrackingLocal(!disableEventTrackingLocal)}
          handleToggleErrorReporting={() => setDisableErrorReportingLocal(!disableErrorReportingLocal)}
        />
      </div>
    </StyledModal>
  );
};

export default TelemetryModal;
