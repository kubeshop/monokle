import React, {useMemo} from 'react';

import {Popover} from 'antd';

import {Icon} from '@atoms';

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
  const hasUnsatisfiedRefs = useMemo(() => {
    if (type === 'incoming') {
      return false;
    }
    return resourceRefs?.some(r => isUnsatisfiedRef(r.type));
  }, [resourceRefs, type]);

  const iconType = useMemo(() => {
    if (type === 'incoming') {
      return 'incomingRefs';
    }
    return 'outgoingRefs';
  }, [type]);

  if (!resourceRefs || resourceRefs.length === 0) {
    return <span style={{minWidth: '20px'}} />;
  }

  if (isDisabled) {
    return null;
  }

  return (
    <Popover
      mouseEnterDelay={0.5}
      placement="rightTop"
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
          style={type === 'incoming' ? {...baseIconStyle, marginRight: 5} : {...baseIconStyle, marginLeft: 5}}
          color={isSelected ? Colors.blackPure : Colors.blue10}
        />
        {hasUnsatisfiedRefs && (
          <Icon
            name="warning"
            style={{...baseIconStyle, marginLeft: 5}}
            color={isSelected ? Colors.blackPure : Colors.yellowWarning}
          />
        )}
      </S.IconsContainer>
    </Popover>
  );
};

export default ResourceRefsIconPopover;
