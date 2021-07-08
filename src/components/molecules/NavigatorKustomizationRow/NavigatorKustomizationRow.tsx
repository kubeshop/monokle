import React from 'react';
import {Col, Row} from 'antd';
import styled from 'styled-components';
import {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';

import {K8sResource} from '@models/k8sresource';

export type NavigatorKustomizationRowProps = {
  key: React.Key;
  resource: K8sResource;
  isSelected: boolean;
  isDisabled: boolean;
  highlighted: boolean;
  previewButtonActive: boolean;
  hasIncomingRefs: boolean;
  hasOutgoingRefs: boolean;
  onClickResource?: React.MouseEventHandler<HTMLDivElement>;
  onClickPreview: React.MouseEventHandler<HTMLDivElement>;
};

const ItemRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
`;

const SectionCol = styled(Col)`
  width: 100%;
  margin: 0;
  padding: 0;
`;

const RowContainer = styled.div`
  .kustomization-row {
    width: 100%;
  }
  .kustomization-row-selected {
    background: linear-gradient(to right, blue, cyan);
    color: black;
  }
  .kustomization-row-disabled {
    color: grey;
  }
  .kustomization-row-highlighted {
    font-weight: bold;
    font-style: italic;
  }
`;

const StyledDiv = styled.div`
  width: 100%;
`;

const NavigatorKustomizationRow = (props: NavigatorKustomizationRowProps) => {
  const {
    key,
    resource,
    isSelected,
    isDisabled,
    highlighted,
    previewButtonActive,
    hasIncomingRefs,
    hasOutgoingRefs,
    onClickResource,
    onClickPreview,
  } = props;

  // Parent needs to make sure disabled and selected arent active at the same time.
  let classname = `kustomization-row'` +
    `${isSelected ? ' kustomization-row-selected' : ''}` +
    `${isDisabled ? ' kustomization-row-disabled' : ''}` +
    `${highlighted ? ' kustomization-row-highlighted' : ''}`;

  return (<RowContainer>
    <StyledDiv className={classname}>
      <ItemRow key={key}>
        <SectionCol sm={22}>
          <div
            className={classname}
            onClick={onClickResource}
          >
            {hasIncomingRefs ? '>> ' : ''}
            {resource.name}
            {hasOutgoingRefs ? ' >>' : ''}
          </div>
        </SectionCol>
        <SectionCol sm={2}>
          {
            previewButtonActive ?
            <EyeInvisibleOutlined onClick={onClickPreview}/>
            : <EyeOutlined onClick={onClickPreview}/>
          }
        </SectionCol>
      </ItemRow>

    </StyledDiv>
  </RowContainer>);
};

export default NavigatorKustomizationRow;
