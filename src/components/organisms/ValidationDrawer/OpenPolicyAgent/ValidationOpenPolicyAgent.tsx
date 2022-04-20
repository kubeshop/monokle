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
  return (
    <>
      <ValidationOpenPolicyAgentHeading onBack={onBack} />

      <S.DescriptionContainer>
        <S.Description>{data.description}</S.Description>

        <S.DescriptionActions>
          <Button>Enable all</Button>
          <Button>Disable all</Button>
        </S.DescriptionActions>
      </S.DescriptionContainer>

      <ValidationOpenPolicyAgentTable />
    </>
  );
}
