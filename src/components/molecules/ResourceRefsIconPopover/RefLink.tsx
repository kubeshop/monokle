import React from 'react';

import path from 'path';
import styled from 'styled-components';

import {ResourceMapType} from '@models/appstate';
import {ResourceRef} from '@models/k8sresource';

import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {Icon} from '@atoms';

import Colors, {FontColors} from '@styles/Colors';

const StyledRefText = styled.span<{isUnsatisfied: boolean; isDisabled: boolean}>`
  ${props => {
    if (!props.isDisabled) {
      return `
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }`;
    }
  }}
  ${props => {
    if (props.isDisabled) {
      return `color: ${FontColors.grey}`;
    }
    if (props.isUnsatisfied) {
      return `color: ${FontColors.warning};`;
    }
  }}
`;

const StyledPositionText = styled.span`
  margin-left: 5px;
  color: ${FontColors.grey};
`;

const getRefTargetName = (ref: ResourceRef, resourceMap: ResourceMapType) => {
  if (ref.target?.type === 'resource' && ref.target.resourceId) {
    const targetResource = resourceMap[ref.target.resourceId];
    if (ref.target.resourceId && targetResource) {
      return targetResource.name;
    }
  }
  if (ref.target?.type === 'file') {
    return path.parse(ref.target.filePath).name;
  }
  return ref.name;
};

const RefIcon = React.memo((props: {resourceRef: ResourceRef; style: React.CSSProperties}) => {
  const {resourceRef, style} = props;
  if (isOutgoingRef(resourceRef.type)) {
    return <Icon name="outgoingRefs" style={style} />;
  }
  if (isIncomingRef(resourceRef.type)) {
    return <Icon name="incomingRefs" style={style} />;
  }
  if (isUnsatisfiedRef(resourceRef.type)) {
    return <Icon name="warning" style={style} color={Colors.yellowWarning} />;
  }
  return null;
});

const ResourceRefLink = (props: {
  resourceRef: ResourceRef;
  resourceMap: ResourceMapType;
  onClick?: () => void;
  isDisabled: boolean;
}) => {
  const {resourceRef, resourceMap, onClick, isDisabled} = props;

  const targetName = getRefTargetName(resourceRef, resourceMap);
  let linkText = targetName;

  if (resourceRef.target?.type === 'file') {
    linkText = `File: ${targetName}`;
  } else if (resourceRef.target?.type === 'resource') {
    if (resourceRef.target.resourceKind) {
      linkText = `${resourceRef.target.resourceKind}: ${targetName}`;
    } else if (resourceRef.target.resourceId) {
      const resourceKind = resourceMap[resourceRef.target.resourceId]?.kind;
      linkText = `${resourceKind}: ${targetName}`;
    }
  }

  const handleClick = () => {
    if (isDisabled || !onClick) {
      return;
    }
    onClick();
  };

  return (
    <div onClick={handleClick}>
      {RefIcon && <RefIcon resourceRef={resourceRef} style={{marginRight: 5}} />}
      <StyledRefText isDisabled={isDisabled} isUnsatisfied={isUnsatisfiedRef(resourceRef.type)}>
        {linkText}
      </StyledRefText>
      {resourceRef.position && (
        <StyledPositionText>
          {resourceRef.position.line}:{resourceRef.position.column}
        </StyledPositionText>
      )}
    </div>
  );
};

export default ResourceRefLink;
