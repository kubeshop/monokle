import React from 'react';

import {useValidationSelector} from '@redux/validation/validation.selectors';

import {CRD_SCHEMA_INTEGRATION} from '@shared/models/validationPlugins';

import {VALIDATION_CONFIGURATION_COMPONENTS} from './ConfigurationComponents';
import CustomValidationCard from './CustomValidationCard';
import ValidationCard from './ValidationCard';
import ValidationCardUpNext from './ValidationCardUpNext';
import * as S from './ValidationOverview.styled';

const ValidationOverview: React.FC = () => {
  const plugins = useValidationSelector(s => Object.values(s.metadata ?? {}));

  return (
    <S.ValidationOverviewContainer>
      {plugins.map(plugin => (
        <ValidationCard
          key={plugin.id}
          plugin={plugin}
          configurable={VALIDATION_CONFIGURATION_COMPONENTS[plugin.name] !== false}
        />
      ))}

      <CustomValidationCard plugin={CRD_SCHEMA_INTEGRATION} />

      <ValidationCardUpNext />
    </S.ValidationOverviewContainer>
  );
};

export default ValidationOverview;
