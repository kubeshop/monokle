import React from 'react';

import {OPA_INTEGRATION} from '@models/integrations';

import ValidationFigure from '@assets/ValidationFigure.svg';

import ValidationCard from './ValidationCard';
import ValidationCardUpNext from './ValidationCardUpNext';
import * as S from './ValidationOverview.styled';

const ValidationOverview: React.FC = () => {
  return (
    <S.ValidationOverviewContainer>
      <S.ValidationImg src={ValidationFigure} />
      <S.ValidationTitle>Boost your validation powers!</S.ValidationTitle>

      <S.ValidationCards>
        <ValidationCard integration={OPA_INTEGRATION} />
        <ValidationCardUpNext />
      </S.ValidationCards>

      {/* <Row gutter={[16, 16]}>
        <Col span={12}>
          <ValidationCard integration={OPA_INTEGRATION} />
        </Col>
        <Col span={12}>
          <ValidationCard integration={YAML_SYNTAX_INTEGRATION} />
        </Col>
        <Col span={12}>
          <ValidationCard integration={K8S_SCHEMA_INTEGRATION} />
        </Col>
        <Col span={12}>
          <ValidationCard integration={RESOURCE_LINKS_INTEGRATION} />
        </Col>
        <Col span={12}>
        
        </Col>
      </Row> */}
    </S.ValidationOverviewContainer>
  );
};

export default ValidationOverview;
