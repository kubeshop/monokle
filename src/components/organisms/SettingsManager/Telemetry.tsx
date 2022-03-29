import React from 'react';

import {Checkbox, Tooltip} from 'antd';

import {InfoCircleOutlined} from '@ant-design/icons';

import {
  DisableErrorReportingTooltip,
  DisableEventTrackingTooltip,
  TelemetryDocumentationUrl,
} from '@constants/tooltips';

import * as S from '@organisms/SettingsManager/styled';

interface TelemetryProps {
  disableEventTracking: boolean;
  disableErrorReporting: boolean;
  handleToggleEventTracking: () => void;
  handleToggleErrorReporting: () => void;
}

export const Telemetry: React.FC<TelemetryProps> = ({
  disableEventTracking,
  disableErrorReporting,
  handleToggleEventTracking,
  handleToggleErrorReporting,
}) => {
  return (
    <S.Div>
      <S.Span style={{display: 'inline-block', marginRight: '8px'}}>Telemetry</S.Span>
      <Tooltip title={TelemetryDocumentationUrl}>
        <InfoCircleOutlined style={{display: 'inline-block'}} />
      </Tooltip>
      <S.Div style={{marginBottom: '8px'}}>
        <Tooltip title={DisableEventTrackingTooltip}>
          <Checkbox checked={disableEventTracking} onChange={handleToggleEventTracking}>
            Disable Usage Data
          </Checkbox>
        </Tooltip>
      </S.Div>
      <S.Div>
        <Tooltip title={DisableErrorReportingTooltip}>
          <Checkbox checked={disableErrorReporting} onChange={handleToggleErrorReporting}>
            Disable Error Reports
          </Checkbox>
        </Tooltip>
      </S.Div>
    </S.Div>
  );
};
