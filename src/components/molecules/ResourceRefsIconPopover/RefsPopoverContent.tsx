import React from 'react';
import {ResourceRef} from '@models/k8sresource';
import {ResourceMapType} from '@models/appstate';
import styled from 'styled-components';
import {Typography, Divider} from 'antd';
import RefLink from './RefLink';

const {Text} = Typography;

const PopoverTitle = styled(Text)`
  font-weight: 500;
`;

const StyledDivider = styled(Divider)`
  margin: 5px 0;
`;

const StyledRefDiv = styled.div`
  display: block;
  margin: 5px 0;
`;

const getRefKind = (ref: ResourceRef, resourceMap: ResourceMapType) => {
  if (ref.target?.type === 'file') {
    return 'File';
  }

  if (ref.target?.type === 'resource') {
    if (ref.target.resourceKind) {
      return ref.target.resourceKind;
    }
    if (ref.target.resourceId) {
      return resourceMap[ref.target.resourceId]?.kind;
    }
  }
};

const ResourceRefsPopover = (props: {
  children: React.ReactNode;
  resourceRefs: ResourceRef[];
  resourceMap: ResourceMapType;
  selectResource: (selectedResource: string) => void;
  selectFilePath: (filePath: string) => void;
}) => {
  const {children, resourceRefs, resourceMap, selectResource, selectFilePath} = props;

  const onLinkClick = (ref: ResourceRef) => {
    if (ref.target?.type === 'resource' && ref.target.resourceId) {
      selectResource(ref.target.resourceId);
    }
    if (ref.target?.type === 'file') {
      selectFilePath(ref.target.filePath);
    }
  };

  return (
    <>
      <PopoverTitle>{children}</PopoverTitle>
      <StyledDivider />
      {resourceRefs
        .sort((a, b) => {
          let kindA = getRefKind(a, resourceMap);
          let kindB = getRefKind(b, resourceMap);

          if (kindA && kindB) {
            return kindA.localeCompare(kindB);
          }
          return 0;
        })
        .map(resourceRef => {
          let key = resourceRef.name;
          if (resourceRef.target?.type === 'file') {
            key = resourceRef.target.filePath;
          }
          if (resourceRef.target?.type === 'resource') {
            if (resourceRef.target.resourceId) {
              key = resourceRef.target.resourceId;
            } else {
              key = resourceRef.target.resourceKind
                ? `${resourceRef.target.resourceKind}-${resourceRef.name}`
                : resourceRef.name;
            }
          }
          return (
            <StyledRefDiv key={key}>
              <RefLink resourceRef={resourceRef} resourceMap={resourceMap} onClick={() => onLinkClick(resourceRef)} />
            </StyledRefDiv>
          );
        })}
    </>
  );
};
export default ResourceRefsPopover;
