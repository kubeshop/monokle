import {shell} from 'electron';

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Input} from 'antd';
import type {MenuProps} from 'antd';

import {DEFAULT_PANE_TITLE_HEIGHT, TEMPLATES_HELP_URL} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {checkForExtensionsUpdates} from '@redux/services/extension';

// import {TemplateManagerPaneReloadTooltip} from "@constants/tooltips";
// import {ReloadOutlined} from "@ant-design/icons";
import TemplateInformation from '@organisms/TemplateManagerPane/TemplateInformation';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {TitleBar} from '@monokle/components';
import {GUIDE} from '@shared/constants/tutorialReferences';
import {AnyTemplate} from '@shared/models/template';
// import {isInPreviewModeSelector} from "@shared/utils";
// import {usePaneHeight} from "@hooks/usePaneHeight";
// import {checkForExtensionsUpdates} from "@redux/services/extension";
// import {DEFAULT_PANE_TITLE_HEIGHT, TEMPLATES_HELP_URL, TOOLTIP_DELAY} from "@constants/constants";
// import {shell} from "electron";
// import {TemplateManagerPaneReloadTooltip} from "@constants/tooltips";
// import {ReloadOutlined} from "@ant-design/icons";
// import TemplateInformation from "@organisms/TemplateManagerPane/TemplateInformation";
// import TemplateModal from "@organisms/TemplateModal";
import {isInPreviewModeSelector} from '@shared/utils';

import TemplateSidebarPreview from './TemplateSidebarPreview';
import * as S from './TemplatesPage.styled';
import TemplatesPageDescriptionBar from './TemplatesPageDescriptionBar';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

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

const onClick: MenuProps['onClick'] = e => {
  console.log('click ', e);
};

const TemplatesPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const isLoadingExistingTemplates = useAppSelector(state => state.extension.isLoadingExistingTemplates);
  const isLoadingExistingTemplatePacks = useAppSelector(state => state.extension.isLoadingExistingTemplatePacks);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const templateMap = useAppSelector(state => state.extension.templateMap);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const templatePackMap = useAppSelector(state => state.extension.templatePackMap);
  const favoriteTemplates = useAppSelector(state => state.config.favoriteTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<AnyTemplate | undefined>(undefined);
  const [searchedValue, setSearchedValue] = useState<string>();
  const [visibleTemplateEntries, setVisibleTemplateEntries] = useState<[string, AnyTemplate][]>();

  const height = usePaneHeight();

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
    if (visibleTemplateEntries) {
      // {visibleTemplateEntries
      //   .sort((a, b) => {
      //     if (favoriteTemplates.includes(a[1].id)) return -1;
      //     if (favoriteTemplates.includes(b[1].id)) return 1;
      //     return 0;
      //   })
      //   .map(([path, template]) => (
      //     <TemplateInformation
      //       key={path}
      //       template={template}
      //       disabled={isInPreviewMode}
      //       onClickOpenTemplate={() => onClickOpenTemplate(template)}
      //     />
      //   ))}
      const items: MenuProps['items'] = [
        getItem('Default Templates', 'sub2', <S.NumberOfTemplates>7</S.NumberOfTemplates>, [
          getItem('Basic Service Deployment', '1', <S.NumberOfResources>2 resources</S.NumberOfResources>),
          getItem('Advanced Pod', '2', <S.NumberOfResources>1 resource</S.NumberOfResources>),
          getItem('Basic Kubernetes Persisted Volume', '3', <S.NumberOfResources>2 resources</S.NumberOfResources>),
          getItem('Basic Kubernetes StatefulSet', '4', <S.NumberOfResources>3 resources</S.NumberOfResources>),
          getItem('RoleBinding and ServiceAccount', '5', <S.NumberOfResources>1 resource</S.NumberOfResources>),
          getItem('Basic service', '6', <S.NumberOfResources>5 resource</S.NumberOfResources>),
        ]),
      ];
    }
  }, [searchedValue, templateMap]);

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
  const items: MenuProps['items'] = [
    getItem('Default Templates', 'sub2', <S.NumberOfTemplates>7</S.NumberOfTemplates>, [
      getItem('Basic Service Deployment', '1', <S.NumberOfResources>2 resources</S.NumberOfResources>),
      getItem('Advanced Pod', '2', <S.NumberOfResources>1 resource</S.NumberOfResources>),
      getItem('Basic Kubernetes Persisted Volume', '3', <S.NumberOfResources>2 resources</S.NumberOfResources>),
      getItem('Basic Kubernetes StatefulSet', '4', <S.NumberOfResources>3 resources</S.NumberOfResources>),
      getItem('RoleBinding and ServiceAccount', '5', <S.NumberOfResources>1 resource</S.NumberOfResources>),
      getItem('Basic service', '6', <S.NumberOfResources>5 resource</S.NumberOfResources>),
    ]),
  ];
  return (
    <S.TemplatesPageContainer className="horizontal reflex-element">
      <S.TemplatesPageTitle>Create Resources from a template</S.TemplatesPageTitle>

      <S.TemplatesPageSidebarsContainer className="horizontal reflex-element">
        <S.TemplateLeftSidebarWrapper className="vertical reflex-element">
          <S.TitleBarWrapper>
            <TitleBar title="Templates" description={<TemplatesPageDescriptionBar />} />
          </S.TitleBarWrapper>

          <S.Container>
            {isLoading ? (
              <S.Skeleton />
            ) : !visibleTemplateEntries ? (
              <p>No templates available.</p>
            ) : (
              <>
                <S.Form>
                  <S.SearchBox>
                    <Input
                      placeholder="Search anything..."
                      value={searchedValue}
                      onChange={e => setSearchedValue(e.target.value)}
                    />
                  </S.SearchBox>
                </S.Form>

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

          <S.Content>
            <S.TemplatesListWrapper className="vertical reflex-container">
              <S.StyledMenu
                onClick={onClick}
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                items={items}
              />
            </S.TemplatesListWrapper>
          </S.Content>
        </S.TemplateLeftSidebarWrapper>

        <S.TemplateSidebarPreviewWrapper className="vertical reflex-element">
          {selectedTemplate && <TemplateSidebarPreview tutorialReferenceLink={GUIDE} template={selectedTemplate} />}
        </S.TemplateSidebarPreviewWrapper>
      </S.TemplatesPageSidebarsContainer>
    </S.TemplatesPageContainer>
  );
};

export default TemplatesPage;
