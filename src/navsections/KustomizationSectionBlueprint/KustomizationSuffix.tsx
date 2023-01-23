import {useAppSelector} from '@redux/hooks';
import {resourceSelector} from '@redux/selectors';

import {ResourceRefsIconPopover} from '@molecules';

import {ItemCustomComponentProps} from '@shared/models/navigator';

const Suffix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resource = useAppSelector(state => resourceSelector(state, itemInstance.id, itemInstance.meta.resourceStorage));
  if (!resource) {
    return null;
  }
  return (
    <ResourceRefsIconPopover
      isSelected={itemInstance.isSelected}
      isDisabled={itemInstance.isDisabled}
      resource={resource}
      type="outgoing"
    />
  );
};

export default Suffix;
