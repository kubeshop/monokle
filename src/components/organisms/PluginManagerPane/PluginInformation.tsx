import React from 'react';

import {Popconfirm} from 'antd';

import {ExclamationOutlined} from '@ant-design/icons';

import {AnyPlugin} from '@models/plugin';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {deletePlugin} from '@redux/services/templates';

import * as S from './PluginInformation.styled';

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
    <S.Container>
      <S.IconContainer>
        <S.AppstoreOutlined />
      </S.IconContainer>

      <S.InfoContainer>
        <S.Name>{plugin.name}</S.Name>
        <S.Description>{plugin.description || 'No description'}</S.Description>
        <S.Footer>
          <S.Author>{plugin.author}</S.Author> <S.Version>{plugin.version}</S.Version>
        </S.Footer>
      </S.InfoContainer>

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
        <S.DeleteOutlined />
      </Popconfirm>
    </S.Container>
  );
};

export default PluginInformation;
