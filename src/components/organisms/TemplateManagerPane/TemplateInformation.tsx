import React from 'react';
import {useMeasure} from 'react-use';

import {Button, Popconfirm} from 'antd';

import {ExclamationOutlined} from '@ant-design/icons';

import {AnyTemplate} from '@models/template';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  deletePlugin,
  deleteStandalonTemplate,
  deleteTemplatePack,
  isPluginTemplate,
  isStandaloneTemplate,
  isTemplatePackTemplate,
} from '@redux/services/templates';

import * as S from './TemplateInformation.styled';

interface IProps {
  template: AnyTemplate;
  templatePath: string;
  onClickOpenTemplate: () => void;
}

const getTemplatePackPluginPath = (templatePath: string) => {
  const splittedTemplatePath = templatePath.split('\\');
  splittedTemplatePath.pop();

  return splittedTemplatePath.join('\\');
};

const TemplateInformation: React.FC<IProps> = props => {
  const {template, templatePath, onClickOpenTemplate} = props;

  const [infoContainerRef, {width: infoContainerWidth}] = useMeasure<HTMLDivElement>();

  const dispatch = useAppDispatch();
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const pluginsDir = useAppSelector(state => state.extension.pluginsDir);
  const templatesDir = useAppSelector(state => state.extension.templatesDir);
  const templatePacksDir = useAppSelector(state => state.extension.templatePacksDir);
  const templatePackMap = useAppSelector(state => state.extension.templatePackMap);

  const handleDelete = () => {
    if (templatesDir && isStandaloneTemplate(templatePath, templatesDir)) {
      deleteStandalonTemplate(templatePath, dispatch);
    } else if (templatePacksDir && isTemplatePackTemplate(templatePath, templatePacksDir)) {
      const templatePackPath = getTemplatePackPluginPath(templatePath);
      deleteTemplatePack(templatePackMap[templatePackPath], templatePackPath, dispatch);
    } else if (pluginsDir && isPluginTemplate(templatePath, pluginsDir)) {
      const pluginPath = getTemplatePackPluginPath(templatePath);
      deletePlugin(pluginMap[pluginPath], pluginPath, dispatch);
    }
  };

  return (
    <S.Container>
      <S.IconContainer>
        <S.FormOutlined />
      </S.IconContainer>

      <S.InfoContainer ref={infoContainerRef}>
        <S.Name>{template.name}</S.Name>
        <span>Type: {template.type}</span>
        <S.Description style={{width: infoContainerWidth}}>{template.description}</S.Description>
        <S.Footer>
          <S.Author>{template.author}</S.Author> <S.Version>{template.version}</S.Version>
        </S.Footer>
        <Button
          onClick={onClickOpenTemplate}
          type="primary"
          ghost
          size="small"
          style={{marginTop: '8px', alignSelf: 'flex-start', width: '50%'}}
        >
          Open
        </Button>
      </S.InfoContainer>

      <Popconfirm
        cancelText="Cancel"
        okText="Delete"
        okType="danger"
        placement="bottom"
        title={() => (
          <>
            <p>Are you sure you want to delete {template.name}?</p>
            {templatePacksDir && isTemplatePackTemplate(templatePath, templatePacksDir) ? (
              <p>
                <ExclamationOutlined style={{color: 'red'}} />
                This will delete all the templates corresponding to the pack.
              </p>
            ) : pluginsDir && isPluginTemplate(templatePath, pluginsDir) ? (
              <p>
                <ExclamationOutlined style={{color: 'red'}} />
                This will delete all the templates corresponding to the plugin.
              </p>
            ) : null}
          </>
        )}
        onConfirm={handleDelete}
      >
        <S.DeleteOutlined />
      </Popconfirm>
    </S.Container>
  );
};

export default TemplateInformation;
