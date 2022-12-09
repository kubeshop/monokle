import {TutorialReferenceLink} from '@shared/models/tutorialReferences';

export const GUIDE: TutorialReferenceLink = {
  type: 'guide',
  name: 'Start Guide',
  description: 'A quick read',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const TUTORIAL: TutorialReferenceLink = {
  type: 'tutorial',
  name: '3-minute Video Tutorial',
  description: 'To learn the basics',
  learnMoreUrl: 'https://github.com/edit/opa',
  isConfigurable: true,
};

export const DOCUMENTATION: TutorialReferenceLink = {
  type: 'documentation',
  name: 'Documentation',
  description: 'In Confluence',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const DISCORD: TutorialReferenceLink = {
  type: 'discord',
  name: 'Discord',
  description: 'Join the conversation',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const WHATSNEW: TutorialReferenceLink = {
  type: 'whatsnew',
  name: "What's New",
  description: 'in the latest version?',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const FEEDBACK: TutorialReferenceLink = {
  type: 'feedback',
  name: 'Feedback',
  description: 'Share your thoughts',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};
