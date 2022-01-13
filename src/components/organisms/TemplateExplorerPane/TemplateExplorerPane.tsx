import React, {useCallback, useState} from 'react';

import {Button, Divider} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import {AnyTemplate} from '@models/template';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@components/molecules';

import TemplateModal from '../TemplateModal';
import TemplateInstallModal from './TemplateInstallModal';

import * as S from './styled';

const TemplatesPane: React.FC = () => {
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState<boolean>(false);
  const [isInstallModalVisible, setIsInstallModalVisible] = useState<boolean>(false);
  const [visibleTemplate, setVisibleTemplate] = useState<AnyTemplate>();

  const templates = useAppSelector(state => state.contrib.templates);

  const onTemplateModalClose = useCallback(() => {
    setIsTemplateModalVisible(!isTemplateModalVisible);
  }, [isTemplateModalVisible]);

  const onClickOpenTemplate = (template: AnyTemplate) => {
    setVisibleTemplate(template);
    setIsTemplateModalVisible(true);
  };

  const openInstallModal = () => {
    setIsInstallModalVisible(true);
  };

  const onCloseInstallModal = () => {
    setIsInstallModalVisible(false);
  };

  return (
    <>
      <TemplateInstallModal isVisible={isInstallModalVisible} onClose={onCloseInstallModal} />
      <TemplateModal isVisible={isTemplateModalVisible} template={visibleTemplate} onClose={onTemplateModalClose} />
      <TitleBar title="Templates">
        <Button onClick={openInstallModal} type="link" size="small" icon={<PlusOutlined />} />
      </TitleBar>
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
