import {Image} from 'antd';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import * as S from './NewValidationPane.styled';

const NewValidationPane: React.FC = () => {
  return (
    <S.ValidationPaneContainer>
      <TitleBarWrapper
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
