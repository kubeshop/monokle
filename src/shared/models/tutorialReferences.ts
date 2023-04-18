type ReferenceLinkType = 'guide' | 'tutorial' | 'documentation' | 'discord' | 'whatsnew' | 'feedback';

type TutorialReferenceLink = {
  type: ReferenceLinkType;
  name: string;
  description: string;
  learnMoreUrl: string;
  isConfigurable?: boolean;
};

export type {TutorialReferenceLink, ReferenceLinkType};
