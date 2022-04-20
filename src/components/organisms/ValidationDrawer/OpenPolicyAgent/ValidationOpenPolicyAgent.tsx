import {useDispatch} from 'react-redux';

import {toggleAllRules} from '@redux/reducers/main';

import {Button} from '@src/App.styled';

import * as S from './ValidationOpenPolicyAgent.styled';
import {ValidationOpenPolicyAgentHeading} from './ValidationOpenPolicyAgentHeading';
import {ValidationOpenPolicyAgentTable} from './ValidationOpenPolicyAgentTable';

const data = {
  description: 'Validate your resources with policies. Enable or disable OPA rules in this list.',
} as const;

type Props = {
  onBack: () => void;
};

export function ValidationOpenPolicyAgent({onBack}: Props) {
  const dispatch = useDispatch();

  return (
    <>
      <ValidationOpenPolicyAgentHeading onBack={onBack} />

      <S.DescriptionContainer>
        <S.Description>{data.description}</S.Description>

        <S.DescriptionActions>
          <Button onClick={() => dispatch(toggleAllRules(true))}>Enable all</Button>
          <Button onClick={() => dispatch(toggleAllRules(false))}>Disable all</Button>
        </S.DescriptionActions>
      </S.DescriptionContainer>

      <ValidationOpenPolicyAgentTable />
    </>
  );
}
