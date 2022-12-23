import {Button as RawButton, Select as RawSelect, Tabs as RawTabs} from 'antd';

import {WarningOutlined as RawWarningOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Div = styled.div`
  margin-bottom: 20px;
`;

export const Span = styled.span`
  font-weight: 500;
  font-size: 20px;
  display: block;
  margin-bottom: 6px;
`;

export const Button = styled(RawButton)`
  margin-top: 10px;
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const Select = styled(RawSelect)`
  width: 100%;
`;

export const Tabs = styled(RawTabs)`
  .ant-tabs-content {
    overflow-y: auto;
    padding: 0.5rem 1rem;
  }
`;

export const OptionContainer = styled.div`
  display: flex;
`;

export const OptionLabel = styled.div`
  width: 60px;
`;

export const OptionDownloadedText = styled.div`
  color: ${Colors.greenOkayCompliment};
`;

export const WarningOutlined = styled(
  (props: {isKubeconfigPathValid: boolean; highlighted?: boolean; className: string}) => (
    <RawWarningOutlined className={props.className} />
  )
)`
  ${props =>
    `color: ${
      props.highlighted ? Colors.whitePure : !props.isKubeconfigPathValid ? Colors.redError : Colors.yellowWarning
    };
    margin-left: ${props.highlighted ? '10px' : '5px'};
    padding-top: ${props.highlighted ? '5px' : '0px'};
    `};
`;

export const Heading = styled.h2`
  font-size: 16px;
  margin-bottom: 7px;
`;

export const TelemetryTitle = styled(Span)`
  display: inline-block;
  margin-right: 8px;
`;

export const TelemetryInfo = styled.p`
  padding: 0;
  margin: 0;
  margin-bottom: 8px;
  margin-top: 0;
`;

export const TelemetryDescription = styled.span`
  color: ${Colors.grey7};
  margin-right: 4px;
  font-size: 14px;
`;

export const TelemetryReadMoreLink = styled.span`
  color: ${Colors.blue6};
  cursor: pointer;

  &:hover {
    color: ${Colors.blue10};
  }
`;

export const BoldSpan = styled.span`
  font-weight: 600;
`;

export const Description = styled.p`
  margin-top: 4px;
  font-size: 14px;
  color: ${Colors.grey7};
`;
