import {Button as RawButton, Select as RawSelect} from 'antd';

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
