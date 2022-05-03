import React from 'react';

import featureJson from '@src/feature-flags.json';

const FEATURES = createFeatureFlags(featureJson, {
  ShowGraphView: false,
  ShowRightMenu: false,
  ActionsPaneFooter: false,
});

function createFeatureFlags<TFeature extends string>(
  overrides: Record<string, boolean>,
  features: Record<TFeature, boolean>
): Record<TFeature, boolean> {
  return {...features, ...overrides};
}

type Props = {
  name: keyof typeof FEATURES;
  fallback?: React.ComponentType | null;
};

export const FeatureFlag: React.FC<Props> = ({name, children, fallback = null}) => {
  return name ? <>{children}</> : <>{fallback}</>;
};

export function useFeatureFlags(): typeof FEATURES {
  return FEATURES;
}
