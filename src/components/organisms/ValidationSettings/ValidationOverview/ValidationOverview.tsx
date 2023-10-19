import React from 'react';

import {useAppSelector} from '@redux/hooks';
import {isUsingCloudPolicySelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {CRD_SCHEMA_INTEGRATION} from '@shared/models/validationPlugins';

import {VALIDATION_CONFIGURATION_COMPONENTS} from './ConfigurationComponents';
import CustomValidationCard from './CustomValidationCard';
import ValidationCard from './ValidationCard';
import {ValidationCardPlugins} from './ValidationCardPlugins';
import {ValidationCardPolicy} from './ValidationCardPolicy';
import ValidationCardUpNext from './ValidationCardUpNext';
import * as S from './ValidationOverview.styled';

const ValidationOverview: React.FC = () => {
  const plugins = useValidationSelector(s => Object.values(s.metadata ?? {}));
  const isUsingCloudPolicy = useAppSelector(isUsingCloudPolicySelector);

  return (
    <S.ValidationOverviewContainer>
      {isUsingCloudPolicy && <ValidationCardPolicy />}

      {plugins.map(plugin => (
        <ValidationCard
          key={plugin.id}
          plugin={plugin}
          configurable={VALIDATION_CONFIGURATION_COMPONENTS[plugin.name] !== false}
        />
      ))}

      <CustomValidationCard plugin={CRD_SCHEMA_INTEGRATION} />

      <ValidationCardPlugins />
      <ValidationCardUpNext />
    </S.ValidationOverviewContainer>
  );
};

export default ValidationOverview;
