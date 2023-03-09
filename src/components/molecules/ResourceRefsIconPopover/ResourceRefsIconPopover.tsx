import React, {useMemo} from 'react';

import {Popover} from 'antd';

import {size} from 'lodash';

import {Icon} from '@monokle/components';
import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@monokle/validation';
import {ResourceMeta} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles/colors';

import RefsPopoverContent from './RefsPopoverContent';
import * as S from './ResourceRefsIconPopover.styled';

const baseIconStyle: React.CSSProperties = {
  fontSize: '14px',
};

const ResourceRefsIconPopover = ({
  resourceMeta,
  type,
  isDisabled,
  isSelected,
}: {
  resourceMeta: ResourceMeta;
  type: 'incoming' | 'outgoing';
  isDisabled: boolean;
  isSelected: boolean;
}) => {
  const resourceRefs = useMemo(
    () =>
      resourceMeta.refs?.filter(r => {
        if (type === 'incoming') {
          return isIncomingRef(r.type);
        }
        return isOutgoingRef(r.type) || isUnsatisfiedRef(r.type);
      }),
    [resourceMeta, type]
  );

  const iconType = useMemo(() => {
    if (type === 'incoming') {
      return 'incomingRefs';
    }
    return 'outgoingRefs';
  }, [type]);

  const incomingColor = useMemo(() => (isSelected ? Colors.blackPure : Colors.blue10), [isSelected]);

  if (isDisabled || !resourceRefs || !size(resourceRefs)) {
    return <span style={{width: '30px', minWidth: '30px'}} />;
  }

  return (
    <Popover
      mouseEnterDelay={0.5}
      placement="bottom"
      content={
        <RefsPopoverContent resource={resourceMeta} resourceRefs={resourceRefs}>
          {type === 'incoming' ? (
            <>
              Incoming Links <Icon name="incomingRefs" />
            </>
          ) : (
            <>
              Outgoing Links <Icon name="outgoingRefs" />
            </>
          )}
        </RefsPopoverContent>
      }
    >
      <S.IconsContainer>
        <Icon
          name={iconType}
          style={
            type === 'incoming'
              ? {...baseIconStyle, margin: '0px 8px', color: incomingColor}
              : {...baseIconStyle, margin: '0px 8px', color: incomingColor}
          }
        />
      </S.IconsContainer>
    </Popover>
  );
};

export default ResourceRefsIconPopover;
