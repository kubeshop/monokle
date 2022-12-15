import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {TitleBar} from '@monokle/components';

import CRDsSchemaValidation from './CRDsSchemaValidation';
import ValidationOverView from './ValidationOverview';
import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const integration = useAppSelector(state => state.main.validationIntegration);

  const height = usePaneHeight();

  const Panel = useMemo(() => {
    switch (integration?.id) {
      case 'crd-schema':
        return CRDsSchemaValidation;
      default:
        return ValidationOverView;
    }
  }, [integration]);

  return (
    <S.ValidationPaneContainer $height={height}>
      <TitleBarWrapper>
        <TitleBar title="Validate your resources" />
      </TitleBarWrapper>

      <Panel />
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
