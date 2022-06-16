import {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useMeasure} from 'react-use';

import {reprocessAllResources, toggleAllRules} from '@redux/reducers/main';

import {Button} from '@src/App.styled';

import * as S from './ValidationOpenPolicyAgent.styled';
import {ValidationOpenPolicyAgentHeading} from './ValidationOpenPolicyAgentHeading';
import {ValidationOpenPolicyAgentTable} from './ValidationOpenPolicyAgentTable';

interface IProps {
  height: number;
}

const ValidationOpenPolicyAgent: React.FC<IProps> = ({height}) => {
  const dispatch = useDispatch();

  const [descriptionRef, {height: descriptionHeight}] = useMeasure<HTMLDivElement>();

  const toggleRules = useCallback(
    (enable: boolean) => {
      dispatch(toggleAllRules(enable));
      dispatch(reprocessAllResources());
    },
    [dispatch]
  );

  return (
    <>
      <div ref={descriptionRef}>
        <ValidationOpenPolicyAgentHeading />
        <S.DescriptionContainer>
          <S.Description>
            Validate your resources with policies. Enable or disable OPA rules in this list.
          </S.Description>

          <S.DescriptionActions>
            <Button onClick={() => toggleRules(true)}>Enable all</Button>
            <Button onClick={() => toggleRules(false)}>Disable all</Button>
          </S.DescriptionActions>
        </S.DescriptionContainer>
      </div>

      <ValidationOpenPolicyAgentTable descriptionHeight={descriptionHeight} height={height} />
    </>
  );
};

export default ValidationOpenPolicyAgent;
