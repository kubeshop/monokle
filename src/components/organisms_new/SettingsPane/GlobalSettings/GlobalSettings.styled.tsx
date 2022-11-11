import {Button as RawButton} from 'antd';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/Colors';

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

export const Heading = styled.h2`
  font-size: 16px;
  margin-bottom: 7px;
`;
