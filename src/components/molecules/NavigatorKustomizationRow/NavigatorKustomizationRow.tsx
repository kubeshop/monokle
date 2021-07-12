import React from 'react';
import {Col, Row} from 'antd';
import styled from 'styled-components';
import {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';

import Colors, {FontColors} from '@styles/Colors';
import {K8sResource} from '@models/k8sresource';

import NavigatorRowRefsPopover, {RefsPopoverType} from '@molecules/NavigatorRowRefsPopover';

export type NavigatorKustomizationRowProps = {
  rowKey: React.Key;
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
  & .kustomization-row {
    width: 100%;
    padding-left: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    font-variant: tabular-nums;
    font-size: 12px;
    font-style: normal;
    font-weight: normal;
    line-height: 22px;
    color: ${FontColors.darkThemeMainFont};
  }
  & .kustomization-row-selected {
    background: ${Colors.selectionGradient};
    font-weight: bold;
    color: black;
  }
  & .kustomization-row-disabled {
    color: grey;
  }
  & .kustomization-row-highlighted {
    font-style: italic;
    font-weight: bold;
    background: ${Colors.highlightGradient};
    color: ${FontColors.resourceRowHighlight};
  }
`;

const StyledDiv = styled.div`
  width: 100%;
`;

const NavigatorKustomizationRow = (props: NavigatorKustomizationRowProps) => {
  const {
    rowKey,
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
  let classname = `kustomization-row\
    ${isSelected ? ` kustomization-row-selected` : ''}\
    ${isDisabled ? ` kustomization-row-disabled` : ''}\
    ${highlighted ? ` kustomization-row-highlighted` : ''}`;

  return (
    <RowContainer>
      <StyledDiv className={classname}>
        <ItemRow key={rowKey}>
          <SectionCol sm={22}>
            <div className={classname} onClick={onClickResource}>
              <NavigatorRowRefsPopover resourceId={rowKey.toString()} type={RefsPopoverType.Incoming} />
              <span style={!hasIncomingRefs ? {marginLeft: 19} : {}}>{resource.name}</span>
              <NavigatorRowRefsPopover resourceId={rowKey.toString()} type={RefsPopoverType.Outgoing} />
            </div>
          </SectionCol>
          <SectionCol sm={2}>
            {previewButtonActive ? (
              <EyeInvisibleOutlined onClick={onClickPreview} />
            ) : (
              <EyeOutlined onClick={onClickPreview} />
            )}
          </SectionCol>
        </ItemRow>
      </StyledDiv>
    </RowContainer>
  );
};

export default NavigatorKustomizationRow;
