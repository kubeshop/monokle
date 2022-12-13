import {shell} from 'electron';

import React, {useCallback} from 'react';

import {TutorialReferenceLink} from '@shared/models/tutorialReferences';

import * as S from './TemplateSidebarPreview.styled';

type Props = {
  tutorialReferenceLink: TutorialReferenceLink;
};

const TemplateSidebarPreview: React.FC<Props> = ({tutorialReferenceLink}) => {
  const {type, name, description, learnMoreUrl} = tutorialReferenceLink;

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  return (
    <S.TutorialSidebar key={type}>
      <span>Here.</span>
    </S.TutorialSidebar>
  );
};

export default TemplateSidebarPreview;
