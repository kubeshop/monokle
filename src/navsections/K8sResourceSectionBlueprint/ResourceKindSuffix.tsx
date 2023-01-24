import {useAppSelector} from '@redux/hooks';
import {resourceMetaSelector} from '@redux/selectors';

import {ResourceRefsIconPopover} from '@molecules';

import {isOutgoingRef, isUnsatisfiedRef} from '@monokle/validation';
import {ItemCustomComponentProps} from '@shared/models/navigator';

const Suffix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const resourceMeta = useAppSelector(state =>
    resourceMetaSelector(state, itemInstance.id, itemInstance.meta?.resourceStorage)
  );

  return (
    <>
      {resourceMeta?.refs?.some(ref => isOutgoingRef(ref.type) || isUnsatisfiedRef(ref.type)) && (
        <ResourceRefsIconPopover
          isSelected={itemInstance.isSelected}
          isDisabled={itemInstance.isDisabled}
          resourceMeta={resourceMeta}
          type="outgoing"
        />
      )}
      {/* {(resource.validation?.errors || resource.issues?.errors) && (
        <ValidationErrorsPopover
          resource={resource}
          isSelected={itemInstance.isSelected}
          isDisabled={itemInstance.isDisabled}
        />
      )} */}
    </>
  );
};

export default Suffix;
