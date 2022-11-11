import {useAppSelector} from '@redux/hooks';
import {isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {ResourceRefsIconPopover, ValidationErrorsPopover} from '@molecules';

import {ItemCustomComponentProps} from '@monokle-desktop/shared/models';

const Suffix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
  if (!resource) {
    return null;
  }

  return (
    <>
      {resource.refs?.some(ref => isOutgoingRef(ref.type) || isUnsatisfiedRef(ref.type)) && (
        <ResourceRefsIconPopover
          isSelected={itemInstance.isSelected}
          isDisabled={itemInstance.isDisabled}
          resource={resource}
          type="outgoing"
        />
      )}
      {(resource.validation?.errors || resource.issues?.errors) && (
        <ValidationErrorsPopover
          resource={resource}
          isSelected={itemInstance.isSelected}
          isDisabled={itemInstance.isDisabled}
        />
      )}
    </>
  );
};

export default Suffix;
