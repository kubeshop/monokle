import ResourceRefsIconPopover from '@components/molecules/ResourceRefsIconPopover';
import {ItemCustomComponentProps} from '@models/navigator';
import {useAppSelector} from '@redux/hooks';

const Suffix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
  if (!resource) {
    return null;
  }
  return <ResourceRefsIconPopover isDisabled={itemInstance.isDisabled} resource={resource} type="outgoing" />;
};

export default Suffix;
