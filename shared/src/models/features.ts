import React from 'react';

type FeatureId = 'explore' | 'edit' | 'validate' | 'publish';

type Feature = {
  id: FeatureId;
  icon: React.ComponentType
  name: string;
  description: string;
  learnMoreUrl: string;
  callToAction: string;
};

export type {Feature, FeatureId};
