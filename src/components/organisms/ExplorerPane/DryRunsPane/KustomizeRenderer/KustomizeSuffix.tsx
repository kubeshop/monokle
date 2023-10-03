import {ResourceRefsIconPopover} from '@components/molecules';

import {ResourceMeta} from '@shared/models/k8sResource';

type IProps = {
  isDisabled: boolean;
  isSelected: boolean;
  resourceMeta: ResourceMeta;
};

const KustomizeSuffix: React.FC<IProps> = props => {
  const {isDisabled, isSelected, resourceMeta} = props;

  if (!resourceMeta) {
    return null;
  }

  return (
    <ResourceRefsIconPopover
      isSelected={isSelected}
      isDisabled={isDisabled}
      resourceMeta={resourceMeta}
      type="outgoing"
    />
  );
};

export default KustomizeSuffix;
