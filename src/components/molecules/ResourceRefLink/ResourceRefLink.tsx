import React from 'react';
import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';
import {ResourceMapType} from '@models/appstate';
import {ResourceRef} from '@models/k8sresource';
import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';
import {FontColors} from '@styles/Colors';
import styled from 'styled-components';

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

  const targetName =
    resourceRef.targetResourceId && resourceMap[resourceRef.targetResourceId]
      ? resourceMap[resourceRef.targetResourceId].name
      : resourceRef.name;

  let linkText = targetName;

  if (resourceRef.targetResourceKind) {
    linkText = `${resourceRef.targetResourceKind}: ${targetName}`;
  } else if (resourceRef.targetResourceId) {
    const resourceKind = resourceMap[resourceRef.targetResourceId].kind;
    linkText = `${resourceKind}: ${targetName}`;
  }

  return (
    <div onClick={onClick}>
      {Icon && <Icon resourceRef={resourceRef} style={{marginRight: 5}} />}
      <StyledRefText isUnsatisfied={isUnsatisfiedRef(resourceRef.type)}>{linkText}</StyledRefText>
    </div>
  );
};

export default ResourceRefLink;
