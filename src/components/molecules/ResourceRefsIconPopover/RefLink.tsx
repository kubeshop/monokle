import React, {useMemo} from 'react';

import path from 'path';

import {ResourceMapType} from '@models/appstate';
import {ResourceRef} from '@models/k8sresource';

import {isUnsatisfiedRef} from '@redux/services/resourceRefs';

import RefIcon from './RefIcon';
import * as S from './RefLink.styled';

interface IProps {
  isDisabled: boolean;
  resourceMap: ResourceMapType;
  resourceRef: ResourceRef;
  onClick?: (args?: any) => void;
}

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

const ResourceRefLink: React.FC<IProps> = props => {
  const {isDisabled, resourceRef, resourceMap, onClick} = props;

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

  const handleClick = (args: any) => {
    if (isDisabled || !onClick) {
      return;
    }
    onClick(args);
  };

  return (
    <S.RefLinkContainer onClick={handleClick}>
      <RefIcon resourceRef={resourceRef} style={{marginRight: 5}} />

      {linkText}

      {resourceRef.position && <S.PositionText>Ln {resourceRef.position.line}</S.PositionText>}
    </S.RefLinkContainer>
  );
};

export default ResourceRefLink;
