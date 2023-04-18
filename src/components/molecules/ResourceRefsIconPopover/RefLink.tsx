import React, {useMemo} from 'react';

import path from 'path';

import {ResourceRef, isUnsatisfiedRef} from '@monokle/validation';
import {ResourceMetaMap} from '@shared/models/k8sResource';

import RefIcon from './RefIcon';
import * as S from './RefLink.styled';

interface IProps {
  isDisabled: boolean;
  resourceMetaMap: ResourceMetaMap;
  resourceRef: ResourceRef;
  onClick?: (args?: any) => void;
}

const getRefTargetName = (ref: ResourceRef, resourceMetaMap: ResourceMetaMap) => {
  if (ref.target?.type === 'resource') {
    if (ref.target.resourceId && resourceMetaMap[ref.target.resourceId]) {
      return resourceMetaMap[ref.target.resourceId].name;
    }
  }
  if (ref.target?.type === 'file') {
    return path.parse(ref.target.filePath).name;
  }
  return ref.name;
};

const ResourceRefLink: React.FC<IProps> = props => {
  const {isDisabled, resourceRef, resourceMetaMap, onClick} = props;

  const linkText = useMemo(() => {
    const targetName = getRefTargetName(resourceRef, resourceMetaMap);

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
        const resourceKind = resourceMetaMap[resourceRef.target.resourceId].kind;
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
  }, [isDisabled, resourceMetaMap, resourceRef]);

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
