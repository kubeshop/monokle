import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@molecules';

import {usePaneHeight} from '@hooks/usePaneHeight';

import CRDsSchemaValidation from './CRDsSchemaValidation';
import ValidationOpenPolicyAgent from './OpenPolicyAgent';
import ValidationOverView from './ValidationOverview';
import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);

  const height = usePaneHeight();

  const Panel = useMemo(() => {
    switch (integration?.id) {
      case 'open-policy-agent':
        return ValidationOpenPolicyAgent;
      case 'crd-schema':
        return CRDsSchemaValidation;
      default:
        return ValidationOverView;
    }
  }, [integration]);

  return (
    <S.ValidationPaneContainer>
      <TitleBar title="Validate your resources" closable />

      <Panel height={height} />
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
