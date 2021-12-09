import React, {useCallback, useState} from 'react';
import {shallowEqual} from 'react-redux';

import {Button, Divider} from 'antd';

import {isTemplatePluginModule} from '@models/plugin.guard';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@components/molecules';

import {TemplateModuleModal} from '..';

import * as S from './styled';

const TemplatesPane: React.FC = () => {
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState<boolean>(false);

  const templates = useAppSelector(state => {
    return state.main.plugins.map(plugin => plugin.modules.filter(module => isTemplatePluginModule(module))).flat();
  }, shallowEqual);

  const onTemplateModalClose = useCallback(() => {
    setIsTemplateModalVisible(!isTemplateModalVisible);
  }, [isTemplateModalVisible]);

  return (
    <>
      <TemplateModuleModal isVisible={isTemplateModalVisible} onClose={onTemplateModalClose} />
      <TitleBar title="Templates" />
      <S.Container>
        {templates.length === 0 ? (
          <p>No templates available.</p>
        ) : (
          templates.map(template => (
            <div key={template.id}>
              <p>{template.id}</p>
              <p style={{fontStyle: 'italic'}}>{template.type}</p>
              <Button onClick={() => setIsTemplateModalVisible(true)} type="primary" ghost size="small">
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
