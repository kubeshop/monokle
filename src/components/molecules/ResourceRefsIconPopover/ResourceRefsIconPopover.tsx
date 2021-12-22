import {useMemo} from 'react';

import {Popover} from 'antd';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';

import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {Icon} from '@atoms';

import Colors from '@styles/Colors';

import RefsPopoverContent from './RefsPopoverContent';

const StyledIconsContainer = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const baseIconStyle: React.CSSProperties = {
  fontSize: '14px',
};

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
        <RefsPopoverContent resource={resource} resourceRefs={resourceRefs}>
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
      <StyledIconsContainer>
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
      </StyledIconsContainer>
    </Popover>
  );
};

export default ResourceRefsIconPopover;
