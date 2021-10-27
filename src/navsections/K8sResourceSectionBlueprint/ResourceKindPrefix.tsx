import ResourceRefsIconPopover from '@components/molecules/ResourceRefsIconPopover';
import {ItemCustomComponentProps} from '@models/navigator';
import {useAppSelector} from '@redux/hooks';

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
  if (!resource) {
    return null;
  }
  return <ResourceRefsIconPopover isDisabled={itemInstance.isDisabled} resource={resource} type="incoming" />;
};

export default Prefix;
