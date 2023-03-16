import {memo} from 'react';

import {isEqual} from 'lodash';

import {ResourceRefsIconPopover} from '@molecules';

import {isOutgoingRef, isUnsatisfiedRef} from '@monokle/validation';
import {ResourceMeta} from '@shared/models/k8sResource';

type Props = {
  resourceMeta: ResourceMeta;
  isSelected: boolean;
};

const Suffix = (props: Props) => {
  const {resourceMeta, isSelected} = props;

  return (
    <>
      {resourceMeta?.refs?.some(ref => isOutgoingRef(ref.type) || isUnsatisfiedRef(ref.type)) && (
        <ResourceRefsIconPopover
          isSelected={isSelected}
          isDisabled={false}
          resourceMeta={resourceMeta}
          type="outgoing"
        />
      )}
    </>
  );
};

export default memo(Suffix, isEqual);
