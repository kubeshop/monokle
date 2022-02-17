import {useMemo} from 'react';

import {SectionCustomization} from '@models/navigator';

export function useSectionCustomization(customization: SectionCustomization = {}) {
  const NameDisplay = useMemo(() => ({Component: customization.nameDisplay?.component}), [customization.nameDisplay]);
  const NamePrefix = useMemo(
    () => ({
      Component: customization.namePrefix?.component,
    }),
    [customization.namePrefix]
  );
  const NameSuffix = useMemo(
    () => ({
      Component: customization.nameSuffix?.component,
      options: customization.nameSuffix?.options,
    }),
    [customization.nameSuffix]
  );
  const EmptyDisplay = useMemo(
    () => ({Component: customization.emptyDisplay?.component}),
    [customization.emptyDisplay]
  );
  const NameContext = useMemo(() => ({Component: customization.nameContext?.component}), [customization.nameContext]);

  return {NameDisplay, EmptyDisplay, NamePrefix, NameSuffix, NameContext};
}
