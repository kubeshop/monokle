import {shell} from 'electron';

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Button, Tooltip} from 'antd';

import {ReloadOutlined} from '@ant-design/icons';

import {DEFAULT_PANE_TITLE_HEIGHT, TEMPLATES_HELP_URL, TOOLTIP_DELAY} from '@constants/constants';
import {TemplateManagerPaneReloadTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {checkForExtensionsUpdates} from '@redux/services/extension';

import {TitleBar} from '@atoms';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {AnyTemplate} from '@monokle-desktop/shared/models/template';
import {isInPreviewModeSelector} from '@monokle-desktop/shared/utils/selectors';

import TemplateModal from '../TemplateModal';
import TemplateInformation from './TemplateInformation';
import * as S from './TemplateManagerPane.styled';

const filterTemplateBySearchedValue = (searchedValue: string, name: string, author: string) => {
  let shouldBeFiltered = true;
  const splittedSearchedValue = searchedValue.split(' ');
  const splittedName = name.split(' ');
  const splittedAuthorName = author.split(' ');

  for (let i = 0; i < splittedSearchedValue.length; i += 1) {
    if (
      !splittedName.find(namePart => namePart.toLowerCase().includes(splittedSearchedValue[i].toLowerCase())) &&
      !splittedAuthorName.find(namePart => namePart.toLowerCase().includes(splittedSearchedValue[i].toLowerCase()))
    ) {
      shouldBeFiltered = false;
      break;
    }
  }

  return shouldBeFiltered;
};

const TemplatesManagerPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedTemplate, setSelectedTemplate] = useState<AnyTemplate | undefined>(undefined);

  const isLoadingExistingTemplates = useAppSelector(state => state.extension.isLoadingExistingTemplates);
  const isLoadingExistingTemplatePacks = useAppSelector(state => state.extension.isLoadingExistingTemplatePacks);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const templateMap = useAppSelector(state => state.extension.templateMap);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const templatePackMap = useAppSelector(state => state.extension.templatePackMap);
  const favoriteTemplates = useAppSelector(state => state.config.favoriteTemplates);

  const [searchedValue, setSearchedValue] = useState<string>();
  const [visibleTemplateEntries, setVisibleTemplateEntries] = useState<[string, AnyTemplate][]>();

  const height = usePaneHeight();

  const isLoading = useMemo(() => {
    return isLoadingExistingTemplates || isLoadingExistingTemplatePacks;
  }, [isLoadingExistingTemplates, isLoadingExistingTemplatePacks]);

  const templates = useMemo(() => {
    return Object.values(templateMap);
  }, [templateMap]);

  const onTemplateModalClose = useCallback(() => {
    setSelectedTemplate(undefined);
  }, []);

  const onClickOpenTemplate = (template: AnyTemplate) => {
    setSelectedTemplate(template);
  };

  const onClickReload = useCallback(
    () => checkForExtensionsUpdates({templateMap, pluginMap, templatePackMap}, dispatch),
    [templateMap, pluginMap, templatePackMap, dispatch]
  );
  const openHelpUrl = () => {
    const repositoryUrl = TEMPLATES_HELP_URL;
    shell.openExternal(repositoryUrl);
  };

  useEffect(() => {
    if (!searchedValue) {
      setVisibleTemplateEntries(Object.entries(templateMap).sort((a, b) => a[1].name.localeCompare(b[1].name)));
    } else {
      setVisibleTemplateEntries(
        Object.entries(templateMap)
          .filter(templateEntry => {
            const templateName = templateEntry[1].name;
            const templateAuthor = templateEntry[1].author;

            return filterTemplateBySearchedValue(searchedValue, templateName, templateAuthor);
          })
          .sort((a, b) => a[1].name.localeCompare(b[1].name))
      );
    }
  }, [searchedValue, templateMap]);

  return (
    <S.TemplateManagerPaneContainer id="TemplateManagerPane" style={{height}}>
      <TitleBar
        title="Templates"
        closable
        leftButtons={
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={TemplateManagerPaneReloadTooltip} placement="bottom">
            <Button
              disabled={templates.length === 0}
              onClick={onClickReload}
              type="link"
              size="small"
              icon={<ReloadOutlined />}
            />
            <S.QuestionCircleOutlined onClick={openHelpUrl} />
          </Tooltip>
        }
      />

      <S.Container>
        {isLoading ? (
          <S.Skeleton />
        ) : !visibleTemplateEntries ? (
          <p>No templates available.</p>
        ) : (
          <>
            <S.SearchInputContainer>
              <S.SearchInput
                placeholder="Search installed templates"
                value={searchedValue}
                onChange={e => setSearchedValue(e.target.value)}
              />
            </S.SearchInputContainer>

            {!visibleTemplateEntries.length ? (
              <S.NotFoundLabel>No templates found.</S.NotFoundLabel>
            ) : (
              <S.TemplatesContainer $height={height - DEFAULT_PANE_TITLE_HEIGHT - 73}>
                {visibleTemplateEntries
                  .sort((a, b) => {
                    if (favoriteTemplates.includes(a[1].id)) return -1;
                    if (favoriteTemplates.includes(b[1].id)) return 1;
                    return 0;
                  })
                  .map(([path, template]) => (
                    <TemplateInformation
                      key={path}
                      template={template}
                      disabled={isInPreviewMode}
                      onClickOpenTemplate={() => onClickOpenTemplate(template)}
                    />
                  ))}
              </S.TemplatesContainer>
            )}
          </>
        )}
      </S.Container>

      {selectedTemplate && <TemplateModal template={selectedTemplate} onClose={onTemplateModalClose} />}
    </S.TemplateManagerPaneContainer>
  );
};

export default TemplatesManagerPane;
