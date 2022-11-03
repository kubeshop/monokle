import {shell} from 'electron';

import React from 'react';

import {Popconfirm} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {AnyPlugin, isTemplatePluginModule} from '@models/plugin';
import {AnyTemplate} from '@models/template';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {deletePlugin} from '@redux/services/templates';

import {ImageIcon} from '@atoms';

import PluginIcon from '@assets/PluginIcon.svg';

import Colors from '@styles/Colors';

import * as S from './PluginInformation.styled';

interface IProps {
  plugin: AnyPlugin;
  pluginPath: string;
}

const PluginInformation: React.FC<IProps> = props => {
  const {plugin, pluginPath} = props;

  const dispatch = useAppDispatch();
  const pluginsDir = useAppSelector(state => state.extension.pluginsDir);
  const pluginTemplates = useAppSelector(state =>
    plugin.modules
      .filter(isTemplatePluginModule)
      .map(module => module.path)
      .map(templatePath => state.extension.templateMap[templatePath])
      .filter((t): t is AnyTemplate => t !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  const handleDelete = () => {
    if (pluginsDir) {
      deletePlugin(plugin, pluginPath, dispatch);
    }
  };

  const openGithub = () => {
    const repositoryUrl = `https://github.com/${plugin.repository.owner}/${plugin.repository.name}`;
    shell.openExternal(repositoryUrl);
  };

  const openHelpUrl = () => {
    if (plugin.helpUrl) {
      shell.openExternal(plugin.helpUrl);
    }
  };

  return (
    <S.Container>
      <ImageIcon src={plugin.icon} fallback={PluginIcon} altText="Plugin_Icon" />

      <S.InfoContainer>
        <S.NameActionsContainer>
          <S.Name>{plugin.name}</S.Name>

          <S.IconsContainer>
            {plugin.helpUrl && <S.QuestionCircleOutlined onClick={openHelpUrl} />}
            <S.GithubOutlined onClick={openGithub} />
            <Popconfirm
              cancelText="Cancel"
              okText="Delete"
              okType="danger"
              placement="bottom"
              icon={<ExclamationCircleOutlined style={{color: Colors.redError}} />}
              title={() => (
                <>
                  <p>
                    Are you sure you want to delete <span style={{fontWeight: 600}}>{plugin.name}</span>?
                  </p>
                  <p>This action will delete the following templates:</p>
                  <ul>
                    {pluginTemplates.map(t => (
                      <li key={t.id}>{t.name}</li>
                    ))}
                  </ul>
                </>
              )}
              onConfirm={handleDelete}
            >
              <S.DeleteOutlined />
            </Popconfirm>
          </S.IconsContainer>
        </S.NameActionsContainer>

        <S.Description>{plugin.description || 'No description'}</S.Description>
        <S.AdditionalInformation>
          <span>Author: {plugin.author}</span>
          <span>Version: {plugin.version}</span>
        </S.AdditionalInformation>
      </S.InfoContainer>
    </S.Container>
  );
};

export default PluginInformation;
