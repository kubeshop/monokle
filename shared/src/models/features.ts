import {IconNames} from './icons';

export type FeatureId = 'explore' | 'edit' | 'validate' | 'publish';

export type Feature = {
  id: FeatureId;
  icon: IconNames;
  name: string;
  description: string;
  learnMoreUrl: string;
  isConfigurable?: boolean;
};

export const EXPLORE: Feature = {
  id: 'explore',
  icon: 'k8s-schema',
  name: 'Explore',
  description: 'Configure your resources workspace, whereas it’s local, on a Git, a cluster or from scratch.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const EDIT: Feature = {
  id: 'edit',
  icon: 'open-policy-agent',
  name: 'Edit',
  description: 'Fix errors in your resources, compare them, learn about yaml best practices and much more.',
  learnMoreUrl: 'https://github.com/edit/opa',
  isConfigurable: true,
};

export const VALIDATE: Feature = {
  id: 'validate',
  icon: 'resource-links',
  name: 'Validate',
  description: 'Configure your policies & validation rules, create your own. See & fix validation errors.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};

export const PUBLISH: Feature = {
  id: 'publish',
  icon: 'yaml-syntax',
  name: 'Publish',
  description: 'Save locally, get into Git (Github, Gitlab), create PRs, deploy to a cluster...',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
};
