import React from 'react';
import {ResourceRef} from '@models/k8sresource';
import {ResourceMapType} from '@models/appstate';
import styled from 'styled-components';
import {Typography, Divider} from 'antd';
import ResourceRefLink from '@components/molecules/ResourceRefLink';

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

const ResourceRefsPopover = (props: {
  children: React.ReactNode;
  resourceRefs: ResourceRef[];
  resourceMap: ResourceMapType;
  selectResource: (selectedResource: string) => void;
}) => {
  const {children, resourceRefs, resourceMap, selectResource} = props;

  const onLinkClick = (ref: ResourceRef) => {
    if (ref.targetResourceId) {
      selectResource(ref.targetResourceId);
    }
  };

  return (
    <>
      <PopoverTitle>{children}</PopoverTitle>
      <StyledDivider />
      {resourceRefs
        .sort((a, b) => {
          let kindA;
          let kindB;
          if (a.targetResourceKind) {
            kindA = a.targetResourceKind;
          } else if (a.targetResourceId) {
            const targetResourceA = resourceMap[a.targetResourceId];
            kindA = targetResourceA?.kind;
          }
          if (b.targetResourceKind) {
            kindB = b.targetResourceKind;
          } else if (b.targetResourceId) {
            const targetResourceB = resourceMap[b.targetResourceId];
            kindB = targetResourceB?.kind;
          }
          if (kindA && kindB) {
            return kindA.localeCompare(kindB);
          }
          return 0;
        })
        .map(resourceRef => (
          <StyledRefDiv key={resourceRef.targetResourceId || resourceRef.name}>
            <ResourceRefLink
              resourceRef={resourceRef}
              resourceMap={resourceMap}
              onClick={() => onLinkClick(resourceRef)}
            />
          </StyledRefDiv>
        ))}
    </>
  );
};
export default ResourceRefsPopover;
