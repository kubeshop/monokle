import {useMemo} from 'react';
import {ItemCustomization} from '@models/navigator';

export function useItemCustomization(customization: ItemCustomization = {}) {
  const Prefix = useMemo(
    () => ({Component: customization.prefix?.component, options: customization.prefix?.options}),
    [customization.prefix]
  );
  const Suffix = useMemo(
    () => ({Component: customization.suffix?.component, options: customization.suffix?.options}),
    [customization.suffix]
  );
  const QuickAction = useMemo(
    () => ({Component: customization.quickAction?.component, options: customization.quickAction?.options}),
    [customization.quickAction]
  );
  const ContextMenu = useMemo(
    () => ({Component: customization.contextMenu?.component, options: customization.contextMenu?.options}),
    [customization.contextMenu]
  );

  return {Prefix, Suffix, QuickAction, ContextMenu};
}
