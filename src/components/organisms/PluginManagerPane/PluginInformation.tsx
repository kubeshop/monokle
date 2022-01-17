import React from 'react';

import {Popconfirm} from 'antd';

import {AppstoreOutlined, DeleteOutlined, ExclamationOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {AnyPlugin} from '@models/plugin';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {deletePlugin} from '@redux/services/templates';

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

const StyledAppstoreOutlined = styled(AppstoreOutlined)`
  font-size: 30px;
  padding-top: 4px;
`;

interface IProps {
  plugin: AnyPlugin;
  pluginPath: string;
}

const PluginInformation: React.FC<IProps> = props => {
  const {plugin, pluginPath} = props;

  const dispatch = useAppDispatch();
  const pluginsDir = useAppSelector(state => state.extension.pluginsDir);

  const handleDelete = () => {
    if (pluginsDir) {
      deletePlugin(plugin, pluginPath, dispatch);
    }
  };

  return (
    <Container>
      <IconContainer>
        <StyledAppstoreOutlined />
      </IconContainer>

      <InfoContainer>
        <Name>{plugin.name}</Name>
        <Description>{plugin.description || 'No description'}</Description>
        <Footer>
          <Author>{plugin.author}</Author> <Version>{plugin.version}</Version>
        </Footer>
      </InfoContainer>

      <Popconfirm
        cancelText="Cancel"
        okText="Delete"
        okType="danger"
        placement="bottom"
        title={() => (
          <>
            <p>Are you sure you want to delete {plugin.name}?</p>
            <p>
              <ExclamationOutlined style={{color: 'red'}} />
              This will also delete all the templates corresponding to the plugin.
            </p>
          </>
        )}
        onConfirm={handleDelete}
      >
        <StyledDeleteOutlined />
      </Popconfirm>
    </Container>
  );
};

export default PluginInformation;
