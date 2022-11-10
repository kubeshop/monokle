import {IconNames} from './icons';

export type FeatureId = 'explore' | 'edit' | 'validate' | 'publish';

export type Feature = {
  id: FeatureId;
  icon: IconNames;
  name: string;
  description: string;
  learnMoreUrl: string;
  CTA: string;
};

export const EXPLORE: Feature = {
  id: 'explore',
  icon: 'unorderedListOutlined',
  name: 'Explore',
  description: 'Configure your resources workspace, whereas it’s local, on a Git, a cluster or from scratch.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
  CTA: 'Your Workspace',
};

export const EDIT: Feature = {
  id: 'edit',
  icon: 'codeTwoTone',
  name: 'Edit',
  description: 'Fix errors in your resources, compare them, learn about yaml best practices and much more.',
  learnMoreUrl: 'https://github.com/edit/opa',
  CTA: 'Edit & fix',
};

export const VALIDATE: Feature = {
  id: 'validate',
  icon: 'checkOutlined',
  name: 'Validate',
  description: 'Configure your policies & validation rules, create your own. See & fix validation errors.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
  CTA: 'Validate',
};

export const PUBLISH: Feature = {
  id: 'publish',
  icon: 'cloudUploadOutlined',
  name: 'Publish',
  description: 'Save locally, get into Git (Github, Gitlab), create PRs, deploy to a cluster...',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
  CTA: 'Publish & Git',
};
