import {useAppSelector} from '@redux/hooks';
import {resourceMetaSelector} from '@redux/selectors';

import {ResourceRefsIconPopover} from '@molecules';

import {ItemCustomComponentProps} from '@shared/models/navigator';

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resourceMeta = useAppSelector(state =>
    resourceMetaSelector(state, itemInstance.id, itemInstance.meta.resourceStorage)
  );
  if (!resourceMeta) {
    return null;
  }
  return (
    <ResourceRefsIconPopover
      isSelected={itemInstance.isSelected}
      isDisabled={itemInstance.isDisabled}
      resourceMeta={resourceMeta}
      type="incoming"
    />
  );
};

export default Prefix;
