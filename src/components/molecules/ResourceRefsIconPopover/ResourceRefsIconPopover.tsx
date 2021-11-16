import {Popover} from 'antd';
import {useMemo} from 'react';
import styled from 'styled-components';

import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {K8sResource} from '@models/k8sresource';

import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';

import RefsPopoverContent from './RefsPopoverContent';

const StyledIconsContainer = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ResourceRefsIconPopover = (props: {
  resource: K8sResource;
  type: 'incoming' | 'outgoing';
  isDisabled: boolean;
  isSelected: boolean;
}) => {
  const {resource, type, isDisabled, isSelected} = props;

  const resourceRefs = useMemo(
    () =>
      resource.refs?.filter(r => {
        if (type === 'incoming') {
          return isIncomingRef(r.type);
        }
        return isOutgoingRef(r.type) || isUnsatisfiedRef(r.type);
      }),
    [resource, type]
  );
  const hasUnsatisfiedRefs = useMemo(() => {
    if (type === 'incoming') {
      return false;
    }
    return resourceRefs?.some(r => isUnsatisfiedRef(r.type));
  }, [resourceRefs, type]);

  const iconType = useMemo(() => {
    if (type === 'incoming') {
      if (isSelected) {
        return MonoIconTypes.IncomingRefsBlack;
      }
      return MonoIconTypes.IncomingRefs;
    }
    if (isSelected) {
      return MonoIconTypes.OutgoingRefsBlack;
    }
    return MonoIconTypes.OutgoingRefs;
  }, [type, isSelected]);

  if (!resourceRefs || resourceRefs.length === 0) {
    return null;
  }

  if (isDisabled) {
    return null;
  }

  return (
    <Popover
      mouseEnterDelay={0.5}
      placement="rightTop"
      content={
        <RefsPopoverContent resource={resource} resourceRefs={resourceRefs}>
          {type === 'incoming' ? (
            <>
              Incoming Links <MonoIcon type={MonoIconTypes.IncomingRefs} />
            </>
          ) : (
            <>
              Outgoing Links <MonoIcon type={MonoIconTypes.OutgoingRefs} />
            </>
          )}
        </RefsPopoverContent>
      }
    >
      <StyledIconsContainer>
        <MonoIcon type={iconType} style={type === 'incoming' ? {marginRight: 5} : {marginLeft: 5}} />
        {hasUnsatisfiedRefs && <MonoIcon type={MonoIconTypes.Warning} style={{marginLeft: 5}} />}
      </StyledIconsContainer>
    </Popover>
  );
};

export default ResourceRefsIconPopover;
