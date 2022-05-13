import {Button as RawButton, Collapse as RawCollapse, Select as RawSelect} from 'antd';

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

export const Collapse = styled(RawCollapse)`
  max-height: 100%;
  overflow-y: auto;
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
`;

export const TelemetryDescription = styled.span`
  color: ${Colors.grey500};
  margin-right: 4px;
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
