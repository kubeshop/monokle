import {useMemo} from 'react';

import {ItemCustomization} from '@models/navigator';

export function useItemCustomization(customization: ItemCustomization = {}, isHovered: boolean) {
  const customPrefix = useMemo(
    () => ({
      Component: customization.prefix?.component,
      isVisible: customization.prefix?.isVisibleOnHover ? isHovered : true,
    }),
    [customization.prefix, isHovered]
  );
  const customSuffix = useMemo(
    () => ({
      Component: customization.suffix?.component,
      isVisible: customization.suffix?.isVisibleOnHover ? isHovered : true,
    }),
    [customization.suffix, isHovered]
  );
  const customQuickAction = useMemo(
    () => ({
      Component: customization.quickAction?.component,
      isVisible: customization.quickAction?.isVisibleOnHover ? isHovered : true,
    }),
    [customization.quickAction, isHovered]
  );
  const customContextMenu = useMemo(
    () => ({
      Component: customization.contextMenu?.component,
      isVisible: customization.contextMenu?.isVisibleOnHover ? isHovered : true,
    }),
    [customization.contextMenu, isHovered]
  );
  const customRow = useMemo(
    () => ({
      Component: customization.row?.component,
    }),
    [customization.row]
  );

  return {customPrefix, customSuffix, customQuickAction, customContextMenu, customRow};
}
