import {K8sResource} from '@models/k8sresource';
import {NavSectionItemCustomComponentProps} from '@models/navsection';
import ResourceRefsIconPopover from '@components/molecules/ResourceRefsIconPopover';

const Suffix = (props: NavSectionItemCustomComponentProps<K8sResource>) => {
  const {item} = props;
  return <ResourceRefsIconPopover resource={item} type="outgoing" />;
};

export default Suffix;
