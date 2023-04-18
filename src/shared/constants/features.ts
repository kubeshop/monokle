import {CheckOutlined, CloudUploadOutlined, CodeTwoTone, UnorderedListOutlined} from '@ant-design/icons';

import {Feature} from '@shared/models/features';

export const EXPLORE: Feature = {
  id: 'explore',
  icon: UnorderedListOutlined,
  name: 'Explore',
  description: 'Configure your resources workspace, whereas it’s local, on a Git, a cluster or from scratch.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
  callToAction: 'Your Workspace',
};

export const EDIT: Feature = {
  id: 'edit',
  icon: CodeTwoTone,
  name: 'Edit',
  description: 'Fix errors in your resources, compare them, learn about yaml best practices and much more.',
  learnMoreUrl: 'https://github.com/edit/opa',
  callToAction: 'Edit & fix',
};

export const VALIDATE: Feature = {
  id: 'validate',
  icon: CheckOutlined,
  name: 'Validate',
  description: 'Configure your policies & validation rules, create your own. See & fix validation errors.',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
  callToAction: 'Validate',
};

export const PUBLISH: Feature = {
  id: 'publish',
  icon: CloudUploadOutlined,
  name: 'Publish',
  description: 'Save locally, get into Git (Github, Gitlab), create PRs, deploy to a cluster...',
  learnMoreUrl: 'https://kubeshop.github.io/monokle/resource-validation/',
  callToAction: 'Publish & Git',
};
