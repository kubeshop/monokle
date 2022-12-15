import React, {useState} from 'react';

import {Col, Input, Row} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {updateSearchQuery} from '@redux/reducers/main';

import {ResourceSetSelector} from '@organismsNew/ResourceSetSelector';
import QueryTemplateParams from '@organismsNew/TemplatesPage/QueryTemplateParams';

import {TitleBar} from '@monokle/components';
// import {useMeasure} from "react-use";
import {GUIDE} from '@shared/constants/tutorialReferences';

import TemplateSidebarPreview from './TemplateSidebarPreview';
import TemplatesList from './TemplatesList';
import * as S from './TemplatesPage.styled';
import TemplatesPageDescriptionBar from './TemplatesPageDescriptionBar';

const TemplatesPage = () => {
  const dispatch = useAppDispatch();

  const [isFindingMatches, setFindingMatches] = useState<boolean>(false);

  const handleSearchQueryChange = (e: {target: HTMLInputElement}) => {
    setFindingMatches(true);
    dispatch(updateSearchQuery(e.target.value));

    // debounceHandler.current && clearTimeout(debounceHandler.current);
    // debounceHandler.current = setTimeout(() => {
    //   findMatches(e.target.value);
    // }, 1000);
  };

  return (
    <S.TemplatesPageContainer>
      <S.TemplateLeftSidebarWrapper className="vertical reflex-element">
        <S.TemplatesPageTitle>Create Resources from a template</S.TemplatesPageTitle>

        <TitleBar title="Templates" description={<TemplatesPageDescriptionBar />} />

        <S.Form>
          <S.SearchBox>
            <Input placeholder="Search anything..." value="" onChange={handleSearchQueryChange} />
            <QueryTemplateParams setFindingMatches={setFindingMatches} />
          </S.SearchBox>
        </S.Form>

        <Row>
          <Col span={10}>
            <ResourceSetSelector side="left" />
          </Col>
          <Col span={4} />
          <Col span={10}>
            <ResourceSetSelector side="right" />
          </Col>
        </Row>

        <S.Content style={{height: `calc(100% - ${1024}px - 100px - 60px)`}}>
          <S.TemplatesListWrapper className="vertical reflex-container">
            <TemplatesList />
          </S.TemplatesListWrapper>
        </S.Content>

        <S.TemplatesPageTitle>Page title</S.TemplatesPageTitle>
      </S.TemplateLeftSidebarWrapper>
      <S.TemplateSidebarPreviewWrapper className="vertical reflex-element">
        <TemplateSidebarPreview tutorialReferenceLink={GUIDE} />
      </S.TemplateSidebarPreviewWrapper>
    </S.TemplatesPageContainer>
  );
};

export default React.memo(TemplatesPage);
