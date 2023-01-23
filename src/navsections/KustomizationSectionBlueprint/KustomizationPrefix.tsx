import {useAppSelector} from '@redux/hooks';
import {resourceSelector} from '@redux/selectors';

import {ResourceRefsIconPopover} from '@molecules';

import {ItemCustomComponentProps} from '@shared/models/navigator';

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resource = useAppSelector(state => {
    const resourceStorage = itemInstance.meta.resourceStorage;
    if (!resourceStorage) {
      return undefined;
    }
    return resourceSelector(state, itemInstance.id, resourceStorage);
  });
  if (!resource) {
    return null;
  }
  return (
    <ResourceRefsIconPopover
      isSelected={itemInstance.isSelected}
      isDisabled={itemInstance.isDisabled}
      resource={resource}
      type="incoming"
    />
  );
};

export default Prefix;
