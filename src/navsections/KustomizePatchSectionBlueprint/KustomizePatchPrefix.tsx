import {useResourceMeta} from '@redux/selectors/resourceSelectors';

import {ResourceRefsIconPopover} from '@molecules';

import {ItemCustomComponentProps} from '@shared/models/navigator';

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const resourceMeta = useResourceMeta({id: itemInstance.id, storage: itemInstance.meta.resourceStorage});

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
