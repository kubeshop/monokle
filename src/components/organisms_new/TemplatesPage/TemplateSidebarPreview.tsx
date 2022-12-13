import React from 'react';

import {TutorialReferenceLink} from '@shared/models/tutorialReferences';

import * as S from './TemplateSidebarPreview.styled';

type Props = {
  tutorialReferenceLink: TutorialReferenceLink;
};

const TemplateSidebarPreview: React.FC<Props> = ({tutorialReferenceLink}) => {
  const {type} = tutorialReferenceLink;

  return (
    <S.TutorialSidebar key={type}>
      <span>Here.</span>
    </S.TutorialSidebar>
  );
};

export default TemplateSidebarPreview;
