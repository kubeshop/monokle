import {useMeasure} from 'react-use';

import {Image, Skeleton} from 'antd';
import Link from 'antd/lib/typography/Link';

import {useAppDispatch} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {useValidationSelector} from '@redux/validation/validation.selectors';
import {setSelectedProblem} from '@redux/validation/validation.slice';

import {usePaneHeight} from '@hooks/usePaneHeight';

import ValidationFigure from '@assets/NewValidationFigure.svg';

import {TitleBar, ValidationOverview} from '@monokle/components';

import * as S from './ValidationPane.styled';

const ValidationPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const lastResponse = useValidationSelector(state => state.lastResponse);
  const newProblemsIntroducedType = useValidationSelector(state => state.validationOverview.newProblemsIntroducedType);
  const selectedProblem = useValidationSelector(state => state.validationOverview.selectedProblem);
  const status = useValidationSelector(state => state.status);

  const [titleBarRef, {height: titleBarHeight}] = useMeasure<HTMLDivElement>();

  const height = usePaneHeight();

  if (!lastResponse) {
    return null;
  }

  return (
    <S.ValidationPaneContainer>
      <div ref={titleBarRef}>
        <TitleBar
          title="Validation Overview"
          description={
            <S.DescriptionContainer>
              <Image src={ValidationFigure} width={95} />
              <div>
                Fix your resources according to your validation setup. Manage your validation policy, turn rules on or
                off, and more in the <Link onClick={() => dispatch(setLeftMenuSelection('settings'))}>settings</Link>{' '}
                section, located in the left menu.
              </div>
            </S.DescriptionContainer>
          }
        />
      </div>

      {status === 'loading' ? (
        <Skeleton active style={{marginTop: '15px'}} />
      ) : (
        <ValidationOverview
          containerStyle={{marginTop: '20px'}}
          height={height - titleBarHeight - 40}
          newProblemsIntroducedType={newProblemsIntroducedType}
          selectedProblem={selectedProblem?.problem}
          validationResponse={lastResponse}
          onProblemSelect={problem => dispatch(setSelectedProblem(problem))}
        />
      )}
    </S.ValidationPaneContainer>
  );
};

export default ValidationPane;
