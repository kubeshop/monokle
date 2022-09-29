import {useCallback} from 'react';
import {useMeasure} from 'react-use';

import {OPA_INTEGRATION} from '@models/integrations';

import {useAppDispatch} from '@redux/hooks';
import {reprocessAllResources, toggleAllRules} from '@redux/reducers/main';

import {Button} from '@src/App.styled';

import ValidationPaneHeading from '../ValidationPaneHeading';
import * as S from './ValidationOpenPolicyAgent.styled';
import {ValidationOpenPolicyAgentTable} from './ValidationOpenPolicyAgentTable';

interface IProps {
  height: number;
}

const ValidationOpenPolicyAgent: React.FC<IProps> = ({height}) => {
  const dispatch = useAppDispatch();

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
        <ValidationPaneHeading integration={OPA_INTEGRATION} />
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
