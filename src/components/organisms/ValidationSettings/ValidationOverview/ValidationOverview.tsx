import React from 'react';

import {
  CRD_SCHEMA_INTEGRATION,
  K8S_SCHEMA_INTEGRATION,
  OPA_INTEGRATION,
  RESOURCE_LINKS_INTEGRATION,
  YAML_SYNTAX_INTEGRATION,
} from '@shared/models/validationPlugins';

import ValidationCard from './ValidationCard';
import ValidationCardUpNext from './ValidationCardUpNext';
import * as S from './ValidationOverview.styled';

const ValidationOverview: React.FC = () => {
  return (
    <S.ValidationOverviewContainer>
      <ValidationCard plugin={OPA_INTEGRATION} />
      <ValidationCard plugin={CRD_SCHEMA_INTEGRATION} />
      <ValidationCard plugin={YAML_SYNTAX_INTEGRATION} />
      <ValidationCard plugin={K8S_SCHEMA_INTEGRATION} />
      <ValidationCard plugin={RESOURCE_LINKS_INTEGRATION} />
      <ValidationCardUpNext />
    </S.ValidationOverviewContainer>
  );
};

export default ValidationOverview;
