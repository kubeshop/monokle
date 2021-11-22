import {ItemCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import ResourceRefsIconPopover from '@components/molecules/ResourceRefsIconPopover';

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
