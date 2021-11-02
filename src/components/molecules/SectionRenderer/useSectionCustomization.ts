import {useMemo} from 'react';
import {SectionCustomization} from '@models/navigator';

export function useSectionCustomization(customization: SectionCustomization = {}) {
  const NameDisplay = useMemo(() => ({Component: customization.nameDisplay?.component}), [customization.nameDisplay]);

  return {NameDisplay};
}
