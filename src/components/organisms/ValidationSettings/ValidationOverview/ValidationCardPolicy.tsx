import styled from 'styled-components';

import CloudManaged from '@assets/CloudManaged.png';

import {Colors} from '@shared/styles';

export function ValidationCardPolicy() {
  return (
    <CardContainer>
      <ImageContainer>
        <Image src={CloudManaged} />
      </ImageContainer>
      <div>
        <Title>A Monokle Cloud policy manages this repository</Title>

        <Description>
          Policies add compliancy across your project&apos;s repositories by providing consistent validation. The
          configuration can no longer be adjusted in this pane. Set up below is <strong>read-only</strong>.
        </Description>
      </div>
    </CardContainer>
  );
}

const CardContainer = styled.div`
  border-radius: 2px;
  background-color: ${Colors.geekblue4};
  padding: 12px;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  padding-right: 32px;
`;

const Description = styled.div`
  color: ${Colors.grey9};
  line-height: 22px;

  & span {
    color: ${Colors.blue7};
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease-in;

    &:hover {
      color: ${Colors.blue6};
    }
  }
`;

const ImageContainer = styled.div`
  padding: 24px;
`;

const Image = styled.img`
  height: 60px;
`;

const Title = styled.div`
  font-weight: 700;
  line-height: 22px;
  color: ${Colors.whitePure};
  margin-bottom: 12px;
`;
