type FeatureId = 'explore' | 'edit' | 'validate' | 'publish';

type Feature = {
  id: FeatureId;
  icon: any;
  name: string;
  description: string;
  learnMoreUrl: string;
  callToAction: string;
};

export type {Feature, FeatureId};
