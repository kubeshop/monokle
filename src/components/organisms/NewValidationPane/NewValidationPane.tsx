import {Image} from 'antd';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {TitleBar} from '@monokle/components';

import * as S from './NewValidationPane.styled';

const NewValidationPane: React.FC = () => {
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
    </S.ValidationPaneContainer>
  );
};

export default NewValidationPane;
