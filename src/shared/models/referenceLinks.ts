type ReferenceLinkId = 'guide' | 'tutorial' | 'documentation' | 'discord' | 'whatsnew' | 'feedback';

type ReferenceLink = {
  id: ReferenceLinkId;
  name: string;
  description: string;
  learnMoreUrl: string;
  isConfigurable?: boolean;
};

export type {ReferenceLink, ReferenceLinkId};
