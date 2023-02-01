import {Image} from 'antd';

import {useAppSelector} from '@redux/hooks';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {TitleBar, ValidationOverview} from '@monokle/components';

import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const lastResponse = useAppSelector(state => state.validation.lastResponse);

  if (!lastResponse) {
    return null;
  }

  return (
    <S.ValidationPaneContainer>
      <TitleBar
        title="Validation errors"
        description={
          <S.DescriptionContainer>
            <Image src={ValidationFigure} width={95} />
            <div>
              Visualize & fix <b>errors</b> according to your validation setup.
            </div>
          </S.DescriptionContainer>
        }
      />

      <ValidationOverview validationResponse={lastResponse} />
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
