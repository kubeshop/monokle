import {ResourceRefsIconPopover} from '@components/molecules';

import {ResourceMeta} from '@shared/models/k8sResource';

type IProps = {
  isSelected: boolean;
  resourceMeta: ResourceMeta;
};

const KustomizeSuffix: React.FC<IProps> = props => {
  const {isSelected, resourceMeta} = props;

  if (!resourceMeta) {
    return null;
  }

  return (
    <ResourceRefsIconPopover isSelected={isSelected} isDisabled={false} resourceMeta={resourceMeta} type="outgoing" />
  );
};

export default KustomizeSuffix;
