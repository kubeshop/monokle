import React from 'react';

import {
  CRD_SCHEMA_INTEGRATION,
  K8S_SCHEMA_INTEGRATION,
  OPA_INTEGRATION,
  RESOURCE_LINKS_INTEGRATION,
  YAML_SYNTAX_INTEGRATION,
} from '@shared/models/integrations';

import ValidationCard from './ValidationCard';
import ValidationCardUpNext from './ValidationCardUpNext';
import * as S from './ValidationOverview.styled';

type IProps = {
  height: number;
};

const ValidationOverview: React.FC<IProps> = props => {
  const {height} = props;

  return (
    <S.ValidationOverviewContainer $height={height}>
      <ValidationCard integration={OPA_INTEGRATION} />
      <ValidationCard integration={CRD_SCHEMA_INTEGRATION} />
      <ValidationCard integration={YAML_SYNTAX_INTEGRATION} />
      <ValidationCard integration={K8S_SCHEMA_INTEGRATION} />
      <ValidationCard integration={RESOURCE_LINKS_INTEGRATION} />
      <ValidationCardUpNext />
    </S.ValidationOverviewContainer>
  );
};

export default ValidationOverview;
