import React, {useCallback, useState} from 'react';

import {Button, Divider} from 'antd';

import {AnyTemplate} from '@models/template';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@components/molecules';

import TemplateModal from '../TemplateModal';

import * as S from './styled';

const TemplatesPane: React.FC = () => {
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState<boolean>(false);
  const [visibleTemplate, setVisibleTemplate] = useState<AnyTemplate>();

  const templates = useAppSelector(state => state.contrib.templates);

  const onTemplateModalClose = useCallback(() => {
    setIsTemplateModalVisible(!isTemplateModalVisible);
  }, [isTemplateModalVisible]);

  const onClickOpenTemplate = (template: AnyTemplate) => {
    setVisibleTemplate(template);
    setIsTemplateModalVisible(true);
  };

  return (
    <>
      <TemplateModal isVisible={isTemplateModalVisible} template={visibleTemplate} onClose={onTemplateModalClose} />
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
