import {Image} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {useValidationSelector} from '@redux/validation/validation.selectors';
import {setSelectedProblem} from '@redux/validation/validation.slice';

import {useMainPaneDimensions} from '@utils/hooks';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {TitleBar, ValidationOverview} from '@monokle/components';

import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const lastResponse = useValidationSelector(state => state.lastResponse);
  const newProblemsIntroducedType = useValidationSelector(state => state.validationOverview.newProblemsIntroducedType);
  const selectedProblem = useValidationSelector(state => state.validationOverview.selectedProblem?.problem);

  const {height} = useMainPaneDimensions();

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
        containerStyle={{marginTop: '20px'}}
        height={height - 197}
        newProblemsIntroducedType={newProblemsIntroducedType}
        selectedProblem={selectedProblem}
        validationResponse={lastResponse}
        onProblemSelect={problem => dispatch(setSelectedProblem(problem))}
      />
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
