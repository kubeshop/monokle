import {memo} from 'react';

import {isEqual} from 'lodash';

import {useResourceMeta} from '@redux/selectors/resourceSelectors';

import {ResourceRefsIconPopover} from '@molecules';

import {isOutgoingRef, isUnsatisfiedRef} from '@monokle/validation';
import {ItemCustomComponentProps} from '@shared/models/navigator';

const Suffix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const resourceMeta = useResourceMeta({id: itemInstance.id, storage: itemInstance.meta?.resourceStorage});

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
    </>
  );
};

export default memo(Suffix, isEqual);
