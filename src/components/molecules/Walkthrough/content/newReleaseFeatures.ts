import {WalkthroughContentProps} from '@models/walkthrough';

export const newReleaseFeaturesContent: WalkthroughContentProps['data'][] = [
  {
    step: 'compare',
    title: 'Compare anything',
    content: 'Compare local, Helm, Kustomize and cluster resources. You can also inspect differences and deploy them.',
  },
  {
    step: 'images',
    title: 'View Images',
    content:
      'An overview with all the images found in your resources. Navigate to their resources or quickly update tag versions.',
  },
];
