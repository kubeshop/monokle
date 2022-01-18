import React, {useCallback, useMemo, useState} from 'react';

import {Button, Tooltip} from 'antd';

import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';

import {TemplateManagerPaneReloadTooltip} from '@constants/tooltips';

import {AnyTemplate} from '@models/template';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {checkForExtensionsUpdates} from '@redux/services/extension';

import {TitleBar} from '@components/molecules';

import TemplateModal from '../TemplateModal';
import TemplateInformation from './TemplateInformation';
import TemplateInstallModal from './TemplateInstallModal';

import * as S from './styled';

const TemplatesPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isInstallModalVisible, setIsInstallModalVisible] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AnyTemplate | undefined>(undefined);

  const templateMap = useAppSelector(state => state.extension.templateMap);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const templatePackMap = useAppSelector(state => state.extension.templatePackMap);

  const templates = useMemo(() => {
    return Object.values(templateMap);
  }, [templateMap]);

  const onTemplateModalClose = useCallback(() => {
    setSelectedTemplate(undefined);
  }, []);

  const onClickOpenTemplate = (template: AnyTemplate) => {
    setSelectedTemplate(template);
  };

  const openInstallModal = () => {
    setIsInstallModalVisible(true);
  };

  const onClickReload = useCallback(
    () => checkForExtensionsUpdates({templateMap, pluginMap, templatePackMap}, dispatch),
    [templateMap, pluginMap, templatePackMap, dispatch]
  );

  const onCloseInstallModal = () => {
    setIsInstallModalVisible(false);
  };

  return (
    <>
      <TitleBar title="Templates">
        <Tooltip title={TemplateManagerPaneReloadTooltip} placement="bottom">
          <Button
            disabled={templates.length === 0}
            onClick={onClickReload}
            type="link"
            size="small"
            icon={<ReloadOutlined />}
          />
        </Tooltip>
        <Button onClick={openInstallModal} type="link" size="small" icon={<PlusOutlined />} />
      </TitleBar>

      <S.Container>
        {!Object.keys(templateMap).length ? (
          <p>No templates available.</p>
        ) : (
          Object.entries(templateMap).map(([path, template]) => (
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
