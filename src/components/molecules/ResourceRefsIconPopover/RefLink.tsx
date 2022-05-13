import React, {useMemo} from 'react';

import path from 'path';
import styled from 'styled-components';

import {ResourceMapType} from '@models/appstate';
import {ResourceRef} from '@models/k8sresource';

import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {Icon} from '@atoms';

import Colors, {FontColors} from '@styles/Colors';

import * as S from './RefLink.styled';

const StyledPositionText = styled.span`
  margin-left: 5px;
  color: ${FontColors.grey};
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

const RefIcon = React.memo((props: {resourceRef: ResourceRef; style: React.CSSProperties}) => {
  const {resourceRef, style} = props;

  if (isOutgoingRef(resourceRef.type)) {
    if (resourceRef.target?.type === 'image') {
      return <Icon name="docker-images" style={style} />;
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
});

const ResourceRefLink = (props: {
  resourceRef: ResourceRef;
  resourceMap: ResourceMapType;
  onClick?: () => void;
  isDisabled: boolean;
}) => {
  const {resourceRef, resourceMap, onClick, isDisabled} = props;

  const linkText = useMemo(() => {
    const targetName = getRefTargetName(resourceRef, resourceMap);

    if (resourceRef.target?.type === 'file') {
      return (
        <S.TargetName $isDisabled={isDisabled} $isUnsatisfied={isUnsatisfiedRef(resourceRef.type)}>
          File: {targetName}
        </S.TargetName>
      );
    }
    if (resourceRef.target?.type === 'resource') {
      if (resourceRef.target.resourceKind) {
        return (
          <>
            <S.TargetName $isDisabled={isDisabled} $isUnsatisfied={isUnsatisfiedRef(resourceRef.type)}>
              {targetName}
            </S.TargetName>
            <S.ResourceKindLabel>{resourceRef.target.resourceKind}</S.ResourceKindLabel>
          </>
        );
      }
      if (resourceRef.target.resourceId) {
        const resourceKind = resourceMap[resourceRef.target.resourceId].kind;
        return (
          <>
            <S.TargetName $isDisabled={isDisabled} $isUnsatisfied={isUnsatisfiedRef(resourceRef.type)}>
              {targetName}
            </S.TargetName>
            <S.ResourceKindLabel>{resourceKind}</S.ResourceKindLabel>
          </>
        );
      }
    }

    if (resourceRef.target?.type === 'image') {
      return (
        <S.TargetName $isDisabled={isDisabled} $isUnsatisfied={isUnsatisfiedRef(resourceRef.type)}>
          {resourceRef.name}:{resourceRef.target?.tag}
        </S.TargetName>
      );
    }

    return <span>{targetName}</span>;
  }, [isDisabled, resourceMap, resourceRef]);

  const handleClick = () => {
    if (isDisabled || !onClick) {
      return;
    }
    onClick();
  };

  return (
    <S.RefLinkContainer onClick={handleClick}>
      {RefIcon && <RefIcon resourceRef={resourceRef} style={{marginRight: 5}} />}

      {linkText}

      {resourceRef.position && <StyledPositionText>Ln {resourceRef.position.line}</StyledPositionText>}
    </S.RefLinkContainer>
  );
};

export default ResourceRefLink;
