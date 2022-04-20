import React from 'react';

import {Col, Row} from 'antd';

import ValidationFigure from '@assets/ValidationFigure.svg';

import type {Integration} from '../ValidationDrawer';
import {ValidationCard} from './ValidationCard';
import {ValidationCardUpnext} from './ValidationCardUpnext';
import * as S from './ValidationOverview.styled';

type Props = {
  onDiscover: (id: Integration) => void;
};

export function ValidationOverView({onDiscover}: Props) {
  return (
    <>
      <S.ValidationImg src={ValidationFigure} />
      <S.ValidationTitle>Boost your validation powers!</S.ValidationTitle>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ValidationCard
            id="open-policy-agent"
            icon="open-policy-agent"
            name="Open Policy Agent"
            description="Open Policy Agent Policy-based control for cloud native environments. Flexible, fine-grained control for administrators across the stack."
            learnMoreUrl="https://github.com/open-policy-agent/opa"
            onDiscover={() => onDiscover('open-policy-agent')}
          />
        </Col>
        <Col span={12}>
          <ValidationCardUpnext />
        </Col>
      </Row>
    </>
  );
}
