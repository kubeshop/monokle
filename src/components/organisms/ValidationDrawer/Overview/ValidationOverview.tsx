import React from 'react';

import {Col, Row} from 'antd';

import ValidationFigure from '@assets/ValidationFigure.svg';

import {OPA_INTEGRATION, ValidationIntegrationId} from '../integrations';
import {ValidationCard} from './ValidationCard';
import {ValidationCardUpnext} from './ValidationCardUpnext';
import * as S from './ValidationOverview.styled';

type Props = {
  onDiscover: (id: ValidationIntegrationId) => void;
};

export function ValidationOverView({onDiscover}: Props) {
  return (
    <>
      <S.ValidationImg src={ValidationFigure} />
      <S.ValidationTitle>Boost your validation powers!</S.ValidationTitle>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ValidationCard integration={OPA_INTEGRATION} onDiscover={() => onDiscover('open-policy-agent')} />
        </Col>
        <Col span={12}>
          <ValidationCardUpnext />
        </Col>
      </Row>
    </>
  );
}
