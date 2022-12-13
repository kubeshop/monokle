import React from 'react';

import {GUIDE} from '@shared/constants/tutorialReferences';

import TemplateSidebarPreview from './TemplateSidebarPreview';
import TemplatesList from './TemplatesList';
import * as S from './TemplatesPage.styled';

const TemplatesPage = () => {
  return (
    <S.TemplatesPageContainer>
      <S.TemplatesPageTitle>Create Resources from a template</S.TemplatesPageTitle>
      <S.TemplatesPageSubTitle>
        Select in which stage of the K8s manifests management you are in (or from which one you want to learn more
        about) and let us show you how Monokle can help you.
      </S.TemplatesPageSubTitle>

      <S.TemplatesListWrapper>
        <TemplatesList />
      </S.TemplatesListWrapper>

      <S.TemplatesPageTitle>Helpful Resources</S.TemplatesPageTitle>
      <S.TemplateSidebarPreviewWrapper>
        <TemplateSidebarPreview tutorialReferenceLink={GUIDE} />
      </S.TemplateSidebarPreviewWrapper>
    </S.TemplatesPageContainer>
  );
};

export default React.memo(TemplatesPage);
