import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@molecules';

import ValidationOpenPolicyAgent from './OpenPolicyAgent';
import ValidationOverView from './ValidationOverview';
import * as S from './ValidationPane.styled';

interface IProps {
  height: number;
}

const ValidationPane: React.FC<IProps> = ({height}) => {
  console.log(height);

  const integration = useAppSelector(state => state.ui.validationDrawer.integration);

  return (
    <S.ValidationPaneContainer>
      <TitleBar title="Validate your resources" closable />

      {integration?.id === 'open-policy-agent' ? <ValidationOpenPolicyAgent /> : <ValidationOverView />}
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
