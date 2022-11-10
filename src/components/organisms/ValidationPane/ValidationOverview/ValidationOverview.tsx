import React from 'react';

import ValidationFigure from '@assets/ValidationFigure.svg';

import {
  CRD_SCHEMA_INTEGRATION,
  K8S_SCHEMA_INTEGRATION,
  OPA_INTEGRATION,
  RESOURCE_LINKS_INTEGRATION,
  YAML_SYNTAX_INTEGRATION,
} from '@monokle-desktop/shared';

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
        <ValidationCard integration={CRD_SCHEMA_INTEGRATION} />
        <ValidationCard integration={YAML_SYNTAX_INTEGRATION} />
        <ValidationCard integration={K8S_SCHEMA_INTEGRATION} />
        <ValidationCard integration={RESOURCE_LINKS_INTEGRATION} />
        <ValidationCardUpNext />
      </S.ValidationCards>
    </S.ValidationOverviewContainer>
  );
};

export default ValidationOverview;
