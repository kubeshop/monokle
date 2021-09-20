import React from 'react';
import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';
import {ResourceMapType} from '@models/appstate';
import {ResourceRef} from '@models/k8sresource';
import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';
import {FontColors} from '@styles/Colors';
import styled from 'styled-components';
import path from 'path';

const StyledRefText = styled.span<{isUnsatisfied: boolean}>`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  ${props => {
    if (props.isUnsatisfied) {
      return `color: ${FontColors.warning};`;
    }
  }}
`;

const getRefTargetName = (ref: ResourceRef, resourceMap: ResourceMapType) => {
  if (ref.target?.type === 'resource') {
    if (ref.target.resourceId && resourceMap[ref.target.resourceId]) {
      return resourceMap[ref.target.resourceId].name;
    }
  }
  if (ref.target?.type === 'file') {
    return path.parse(ref.target.filePath).name;
  }
  return ref.name;
};

const Icon = React.memo((props: {resourceRef: ResourceRef; style: React.CSSProperties}) => {
  const {resourceRef, style} = props;
  if (isOutgoingRef(resourceRef.type)) {
    return <MonoIcon type={MonoIconTypes.OutgoingRefs} style={style} />;
  }
  if (isIncomingRef(resourceRef.type)) {
    return <MonoIcon type={MonoIconTypes.IncomingRefs} style={style} />;
  }
  if (isUnsatisfiedRef(resourceRef.type)) {
    return <MonoIcon type={MonoIconTypes.Warning} style={style} />;
  }
  return null;
});

const ResourceRefLink = (props: {resourceRef: ResourceRef; resourceMap: ResourceMapType; onClick?: () => void}) => {
  const {resourceRef, resourceMap, onClick} = props;

  const targetName = getRefTargetName(resourceRef, resourceMap);
  let linkText = targetName;

  if (resourceRef.target?.type === 'file') {
    linkText = `File: ${targetName}`;
  } else if (resourceRef.target?.type === 'resource') {
    if (resourceRef.target.resourceKind) {
      linkText = `${resourceRef.target.resourceKind}: ${targetName}`;
    } else if (resourceRef.target.resourceId) {
      const resourceKind = resourceMap[resourceRef.target.resourceId].kind;
      linkText = `${resourceKind}: ${targetName}`;
    }
  }

  return (
    <div onClick={onClick}>
      {Icon && <Icon resourceRef={resourceRef} style={{marginRight: 5}} />}
      <StyledRefText isUnsatisfied={isUnsatisfiedRef(resourceRef.type)}>{linkText}</StyledRefText>
    </div>
  );
};

export default ResourceRefLink;
