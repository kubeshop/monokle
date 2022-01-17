import React from 'react';

import {Button, Popconfirm} from 'antd';

import {DeleteOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {AnyTemplate} from '@models/template';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {deleteStandalonTemplate, isStandaloneTemplate} from '@redux/services/templates';

import Colors from '@styles/Colors';

const Container = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  position: relative;
  margin-bottom: 16px;
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

const StyledDeleteOutlined = styled(DeleteOutlined)`
  position: absolute;
  top: 5px;
  right: 5px;
  color: ${Colors.red7};
  cursor: pointer;
`;

interface IProps {
  template: AnyTemplate;
  templatePath: string;
  onClickOpenTemplate: () => void;
}

const TemplateInformation: React.FC<IProps> = props => {
  const {template, templatePath, onClickOpenTemplate} = props;

  const dispatch = useAppDispatch();
  const templatesDir = useAppSelector(state => state.extension.templatesDir);

  const handleDelete = () => {
    if (templatesDir && isStandaloneTemplate(templatePath, templatesDir)) {
      deleteStandalonTemplate(templatePath, dispatch);
    }
  };

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
        <Button onClick={onClickOpenTemplate} type="primary" ghost size="small" style={{marginTop: '8px'}}>
          Open
        </Button>
      </InfoContainer>

      <Popconfirm
        cancelText="Cancel"
        okText="Delete"
        okType="danger"
        placement="top"
        title={`Are you sure you want to delete ${template.name}`}
        onConfirm={handleDelete}
      >
        <StyledDeleteOutlined />
      </Popconfirm>
    </Container>
  );
};

export default TemplateInformation;
