import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {reprocessAllResources, toggleAllRules} from '@redux/reducers/main';

import {Button} from '@src/App.styled';

import * as S from './ValidationOpenPolicyAgent.styled';
import {ValidationOpenPolicyAgentHeading} from './ValidationOpenPolicyAgentHeading';
import {ValidationOpenPolicyAgentTable} from './ValidationOpenPolicyAgentTable';

type Props = {
  onBack: () => void;
};

export function ValidationOpenPolicyAgent({onBack}: Props) {
  const dispatch = useDispatch();

  const toggleRules = useCallback(
    (enable: boolean) => {
      dispatch(toggleAllRules(enable));
      dispatch(reprocessAllResources());
    },
    [dispatch]
  );

  return (
    <>
      <ValidationOpenPolicyAgentHeading onBack={onBack} />

      <S.DescriptionContainer>
        <S.Description>Validate your resources with policies. Enable or disable OPA rules in this list.</S.Description>

        <S.DescriptionActions>
          <Button onClick={() => toggleRules(true)}>Enable all</Button>
          <Button onClick={() => toggleRules(false)}>Disable all</Button>
        </S.DescriptionActions>
      </S.DescriptionContainer>

      <ValidationOpenPolicyAgentTable />
    </>
  );
}
