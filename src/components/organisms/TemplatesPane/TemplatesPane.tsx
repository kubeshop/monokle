import React, {useCallback, useState} from 'react';
import {shallowEqual} from 'react-redux';

import {Button, Divider} from 'antd';

import {TemplatePluginModule} from '@models/plugin';
import {isTemplatePluginModule} from '@models/plugin.guard';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@components/molecules';

import {TemplateModuleModal} from '..';

import * as S from './styled';

const TemplatesPane: React.FC = () => {
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState<boolean>(false);
  const [visibleTemplate, setVisibleTemplate] = useState<TemplatePluginModule>();

  const templates = useAppSelector(state => {
    return state.main.plugins.map(plugin => plugin.modules.filter(module => isTemplatePluginModule(module))).flat();
  }, shallowEqual);

  const onTemplateModalClose = useCallback(() => {
    setIsTemplateModalVisible(!isTemplateModalVisible);
  }, [isTemplateModalVisible]);

  const onClickOpenTemplate = (template: TemplatePluginModule) => {
    setVisibleTemplate(template);
    setIsTemplateModalVisible(true);
  };

  return (
    <>
      <TemplateModuleModal
        isVisible={isTemplateModalVisible}
        template={visibleTemplate}
        onClose={onTemplateModalClose}
      />
      <TitleBar title="Templates" />
      <S.Container>
        {templates.length === 0 ? (
          <p>No templates available.</p>
        ) : (
          templates.map(template => (
            <div key={template.id}>
              <p>{template.id}</p>
              <p style={{fontStyle: 'italic'}}>{template.type}</p>
              <Button onClick={() => onClickOpenTemplate(template)} type="primary" ghost size="small">
                Open
              </Button>
              <Divider />
            </div>
          ))
        )}
      </S.Container>
    </>
  );
};

export default TemplatesPane;
