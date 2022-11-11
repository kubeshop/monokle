import React from 'react';

import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {Icon} from '@atoms';

import {ResourceRef} from '@monokle-desktop/shared/models';
import {Colors} from '@monokle-desktop/shared/styles/colors';

interface IProps {
  resourceRef: ResourceRef;
  style: React.CSSProperties;
}

const RefIcon: React.FC<IProps> = props => {
  const {resourceRef, style} = props;

  if (isOutgoingRef(resourceRef.type)) {
    if (resourceRef.target?.type === 'image') {
      return <Icon name="images" style={style} />;
    }

    return <Icon name="outgoingRefs" style={style} />;
  }

  if (isIncomingRef(resourceRef.type)) {
    return <Icon name="incomingRefs" style={style} />;
  }

  if (isUnsatisfiedRef(resourceRef.type)) {
    return <Icon name="warning" style={style} color={Colors.yellowWarning} />;
  }

  return null;
};

export default React.memo(RefIcon);
