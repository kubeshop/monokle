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

  const templates = useAppSelector(state => state.extension.templateMap);

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
      <TitleBar title="Templates">
        <Button onClick={openInstallModal} type="link" size="small" icon={<PlusOutlined />} />
      </TitleBar>

      <S.Container>
        {!Object.keys(templates).length ? (
          <p>No templates available.</p>
        ) : (
          Object.entries(templates).map(([path, template]) => (
            <TemplateInformation
              key={template.id}
              template={template}
              templatePath={path}
              onClickOpenTemplate={() => onClickOpenTemplate(template)}
            />
          ))
        )}
      </S.Container>

      {isInstallModalVisible && (
        <TemplateInstallModal isVisible={isInstallModalVisible} onClose={onCloseInstallModal} />
      )}

      {selectedTemplate && <TemplateModal template={selectedTemplate} onClose={onTemplateModalClose} />}
    </>
  );
};

export default TemplatesPane;
