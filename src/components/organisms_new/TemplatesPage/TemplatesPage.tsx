import React from 'react';

import {GUIDE} from '@shared/constants/tutorialReferences';

import TemplateSidebarPreview from './TemplateSidebarPreview';
import TemplatesList from './TemplatesList';
import * as S from './TemplatesPage.styled';

const TemplatesPage = () => {
  return (
    <S.TemplatesPageContainer>
      <S.TemplatesPageTitle>Create Resources from a template</S.TemplatesPageTitle>
      <S.TemplatesPageSubTitle>Subtitle</S.TemplatesPageSubTitle>

      <S.TemplatesListWrapper>
        <TemplatesList />
      </S.TemplatesListWrapper>

      <S.TemplatesPageTitle>Page title</S.TemplatesPageTitle>
      <S.TemplateSidebarPreviewWrapper>
        <TemplateSidebarPreview tutorialReferenceLink={GUIDE} />
      </S.TemplateSidebarPreviewWrapper>
    </S.TemplatesPageContainer>
  );
};

export default React.memo(TemplatesPage);
