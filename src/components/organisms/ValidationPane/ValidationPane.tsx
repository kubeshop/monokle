import {useMemo} from 'react';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

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
    <S.ValidationPaneContainer $height={height}>
      <div style={{padding: '10px'}}>
        <TitleBarWrapper title="Validate your resources" />
      </div>

      <Panel height={height - DEFAULT_PANE_TITLE_HEIGHT} />
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
