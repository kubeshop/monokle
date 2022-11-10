export type ResourceLinkId = 'guide' | 'tutorial' | 'documentation' | 'discord' | 'whatsnew' | 'feedback';

export type ResourceLink = {
  id: ResourceLinkId;
  name: string;
  description: string;
  learnMoreUrl: string;
  isConfigurable?: boolean;
};

export const GUIDE: ResourceLink = {
  id: 'guide',
  name: 'Start Guide',
  description: 'A quick read',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const TUTORIAL: ResourceLink = {
  id: 'tutorial',
  name: '3-minute Video Tutorial',
  description: 'To learn the basics',
  learnMoreUrl: 'https://github.com/edit/opa',
  isConfigurable: true,
};

export const DOCUMENTATION: ResourceLink = {
  id: 'documentation',
  name: 'Documentation',
  description: 'In Confluence',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const DISCORD: ResourceLink = {
  id: 'discord',
  name: 'Discord',
  description: 'Join the conversation',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const WHATSNEW: ResourceLink = {
  id: 'whatsnew',
  name: "What's New",
  description: 'in the latest version?',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const FEEDBACK: ResourceLink = {
  id: 'feedback',
  name: 'Feedback',
  description: 'Share your thoughts',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};
