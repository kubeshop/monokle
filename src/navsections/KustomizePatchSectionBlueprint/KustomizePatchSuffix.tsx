import {useAppSelector} from '@redux/hooks';

import {ResourceRefsIconPopover} from '@molecules';

import {ItemCustomComponentProps} from '@monokle-desktop/shared';

const Suffix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
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
