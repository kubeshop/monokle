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
  const ContextMenuWrapper = useMemo(
    () => ({Component: customization.contextMenuWrapper?.component, options: customization.contextMenuWrapper?.options}),
    [customization.contextMenuWrapper]
  );
  const ContextMenu = useMemo(
    () => ({Component: customization.contextMenu?.component, options: customization.contextMenu?.options}),
    [customization.contextMenu]
  );
  const NameDisplay = useMemo(
    () => ({Component: customization.nameDisplay?.component, options: customization.nameDisplay?.options}),
    [customization.nameDisplay]
  );

  return {Prefix, Suffix, QuickAction, ContextMenu, ContextMenuWrapper, NameDisplay};
}
