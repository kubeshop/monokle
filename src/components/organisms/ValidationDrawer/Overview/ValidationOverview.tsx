import React from 'react';

import {Col, Row} from 'antd';

import {OPA_INTEGRATION} from '@models/integrations';

import ValidationFigure from '@assets/ValidationFigure.svg';

import {ValidationCard} from './ValidationCard';
import {ValidationCardUpnext} from './ValidationCardUpnext';
import * as S from './ValidationOverview.styled';

export const ValidationOverView: React.FC = () => {
  return (
    <>
      <S.ValidationImg src={ValidationFigure} />
      <S.ValidationTitle>Boost your validation powers!</S.ValidationTitle>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ValidationCard integration={OPA_INTEGRATION} />
        </Col>
        <Col span={12}>
          <ValidationCardUpnext />
        </Col>
      </Row>
    </>
  );
};
