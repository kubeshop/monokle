import {Button} from 'antd';

import styled from 'styled-components';

import {Kubernetes} from '@components/atoms/Icon/Icons';

const props = {
  id: 'open-policy-agent',
  icon: <Kubernetes />,
  title: 'Open Policy Agent',
  description:
    'Open Policy Agent Policy-based control for cloud native environments. Flexible, fine-grained control for administrators across the stack.',
  learnMoreUri: 'https://github.com/open-policy-agent/opa',
};

export function ValidationCard() {
  const {icon, title, description, learnMoreUri} = props;
  return (
    <CardContainer>
      {icon}
      <h1>{title}</h1>
      <p>
        {description}{' '}
        <span>
          <a href={learnMoreUri}>Learn more</a>
        </span>
      </p>

      <Button>Configure</Button>
    </CardContainer>
  );
}

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
