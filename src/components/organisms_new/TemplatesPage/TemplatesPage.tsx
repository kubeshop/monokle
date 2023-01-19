import React, {useState} from 'react';

import {Input} from 'antd';
import type {MenuProps} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {updateSearchQuery} from '@redux/reducers/main';

import QueryTemplateParams from '@organismsNew/TemplatesPage/QueryTemplateParams';

import {TitleBar} from '@monokle/components';
import {GUIDE} from '@shared/constants/tutorialReferences';

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

const TemplatesPage = () => {
  const onClick: MenuProps['onClick'] = e => {
    // console.log('click ', e);
  };

  const dispatch = useAppDispatch();

  const [isFindingMatches, setFindingMatches] = useState<boolean>(false);

  const handleSearchQueryChange = (e: {target: HTMLInputElement}) => {
    setFindingMatches(true);
    dispatch(updateSearchQuery(e.target.value));
  };

  return (
    <S.TemplatesPageContainer className="horizontal reflex-element">
      <S.TemplatesPageTitle>Create Resources from a template</S.TemplatesPageTitle>

      <S.TemplatesPageSidebarsContainer className="horizontal reflex-element">
        <S.TemplateLeftSidebarWrapper className="vertical reflex-element">
          <S.TitleBarWrapper>
            <TitleBar title="Templates" description={<TemplatesPageDescriptionBar />} />
          </S.TitleBarWrapper>

          <S.Form>
            <S.SearchBox>
              <Input placeholder="Search anything..." value="" onChange={handleSearchQueryChange} />
              <QueryTemplateParams setFindingMatches={setFindingMatches} />
            </S.SearchBox>
          </S.Form>

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
          <TemplateSidebarPreview tutorialReferenceLink={GUIDE} />
        </S.TemplateSidebarPreviewWrapper>
      </S.TemplatesPageSidebarsContainer>
    </S.TemplatesPageContainer>
  );
};

export default React.memo(TemplatesPage);
