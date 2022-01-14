import React, {useCallback, useState} from 'react';

import {Button} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import {AnyTemplate} from '@models/template';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@components/molecules';

import TemplateModal from '../TemplateModal';
import TemplateInformation from './TemplateInformation';
import TemplateInstallModal from './TemplateInstallModal';

import * as S from './styled';

const TemplatesPane: React.FC = () => {
  const [isInstallModalVisible, setIsInstallModalVisible] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AnyTemplate | undefined>(undefined);

  const templates = useAppSelector(state => Object.values(state.extension.templateMap));

  const onTemplateModalClose = useCallback(() => {
    setSelectedTemplate(undefined);
  }, []);

  const onClickOpenTemplate = (template: AnyTemplate) => {
    setSelectedTemplate(template);
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
      {selectedTemplate && <TemplateModal template={selectedTemplate} onClose={onTemplateModalClose} />}
      <TitleBar title="Templates">
        <Button onClick={openInstallModal} type="link" size="small" icon={<PlusOutlined />} />
      </TitleBar>
      <S.Container>
        {templates.length === 0 ? (
          <p>No templates available.</p>
        ) : (
          templates.map(template => (
            <TemplateInformation
              key={template.id}
              template={template}
              onClickOpenTemplate={() => onClickOpenTemplate(template)}
            />
          ))
        )}
      </S.Container>
    </>
  );
};

export default TemplatesPane;
