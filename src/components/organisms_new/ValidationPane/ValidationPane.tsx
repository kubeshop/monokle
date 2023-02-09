import {Image, Skeleton} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {useValidationSelector} from '@redux/validation/validation.selectors';
import {setSelectedProblem} from '@redux/validation/validation.slice';

import {useMainPaneDimensions} from '@utils/hooks';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {TitleBar, ValidationOverview} from '@monokle/components';

import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useValidationSelector(state => state.status);
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
        title="Validation"
        description={
          <S.DescriptionContainer>
            <Image src={ValidationFigure} width={95} />
            <div>Fix your resources according to your validation setup.</div>
          </S.DescriptionContainer>
        }
      />

      {status === 'loading' ? (
        <Skeleton active style={{marginTop: '15px'}} />
      ) : (
        <ValidationOverview
          containerStyle={{marginTop: '20px'}}
          height={height - 197}
          newProblemsIntroducedType={newProblemsIntroducedType}
          selectedProblem={selectedProblem}
          validationResponse={lastResponse}
          onProblemSelect={problem => dispatch(setSelectedProblem(problem))}
        />
      )}
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
