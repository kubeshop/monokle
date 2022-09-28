import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@molecules';

import CRDsSchemaValidation from './CRDsSchemaValidation';
import ValidationOpenPolicyAgent from './OpenPolicyAgent';
import ValidationOverView from './ValidationOverview';
import * as S from './ValidationPane.styled';

interface IProps {
  height: number;
}

const ValidationPane: React.FC<IProps> = ({height}) => {
  const integration = useAppSelector(state => state.main.validationIntegration);

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
