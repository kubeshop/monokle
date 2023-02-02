import {Image} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {useValidationSelector} from '@redux/validation/validation.selectors';
import {setSelectedProblem} from '@redux/validation/validation.slice';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {TitleBar, ValidationOverview} from '@monokle/components';

import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const lastResponse = useValidationSelector(state => state.lastResponse);
  const selectedProblem = useValidationSelector(state => state.validationOverview.selectedProblem?.problem);

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

      <ValidationOverview
        selectedProblem={selectedProblem}
        validationResponse={lastResponse}
        onProblemSelect={problem => dispatch(setSelectedProblem(problem))}
      />
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
