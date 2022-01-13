import React from 'react';

import {Button} from 'antd';

import styled from 'styled-components';

import {AnyTemplate} from '@models/template';

import Colors from '@styles/Colors';

const Container = styled.div`
  width: 100%;
  display: flex;
`;

const IconContainer = styled.span`
  height: 50px;
  width: 50px;
`;

const InfoContainer = styled.span`
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-weight: 600;
`;

const Description = styled.span`
  font-weight: 300;
`;

const Footer = styled.span`
  display: flex;
  justify-content: space-between;
`;

const Author = styled.span`
  color: ${Colors.grey500};
`;

const Version = styled.span`
  font-style: italic;
`;

function TemplateInformation(props: {template: AnyTemplate; onClickOpenTemplate: () => void}) {
  const {template, onClickOpenTemplate} = props;
  return (
    <Container>
      <IconContainer>
        <span />
      </IconContainer>
      <InfoContainer>
        <Name>{template.name}</Name>
        <span>Type: {template.type}</span>
        <Description>{template.description}</Description>
        <Footer>
          <Author>{template.author}</Author> <Version>{template.version}</Version>
        </Footer>
        <Button onClick={onClickOpenTemplate} type="primary" ghost size="small">
          Open
        </Button>
      </InfoContainer>
    </Container>
  );
}

export default TemplateInformation;
