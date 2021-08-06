import React, {useState} from 'react';
import {Col, Row, Spin, Tooltip} from 'antd';
import styled from 'styled-components';
import {LoadingOutlined} from '@ant-design/icons';

import Colors, {FontColors} from '@styles/Colors';
import {K8sResource} from '@models/k8sresource';

import NavigatorRowLabel from '@molecules/NavigatorRowLabel';
import {ExitKustomizationPreviewTooltip, KustomizationPreviewTooltip} from '@src/tooltips';
import {TOOLTIP_DELAY} from '@src/constants';

const PreviewLoadingIcon = <LoadingOutlined style={{fontSize: 16}} spin />;

export type NavigatorKustomizationRowProps = {
  rowKey: React.Key;
  resource: K8sResource;
  isSelected: boolean;
  isDisabled: boolean;
  highlighted: boolean;
  previewButtonActive: boolean;
  hasIncomingRefs: boolean;
  hasOutgoingRefs: boolean;
  isPreviewLoading: boolean;
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

const PreviewContainer = styled.span`
  float: right;
  margin-left: 15px;
  margin-right: 15px;
`;

const PreviewSpan = styled.span<{isSelected: boolean}>`
  font-weight: 500;
  cursor: pointer;
  color: ${props => (props.isSelected ? Colors.blackPure : Colors.blue6)};
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
    isPreviewLoading,
  } = props;

  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Parent needs to make sure disabled and selected arent active at the same time.
  let classname = `kustomization-row\
    ${isSelected ? ` kustomization-row-selected` : ''}\
    ${isDisabled ? ` kustomization-row-disabled` : ''}\
    ${highlighted ? ` kustomization-row-highlighted` : ''}`;

  return (
    <RowContainer>
      <StyledDiv className={classname}>
        <ItemRow key={rowKey} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <SectionCol sm={22}>
            <div className={classname}>
              <NavigatorRowLabel
                isSelected={isSelected}
                isHighlighted={highlighted}
                label={resource.name}
                resourceId={rowKey.toString()}
                hasIncomingRefs={hasIncomingRefs}
                hasOutgoingRefs={hasOutgoingRefs}
                onClickLabel={onClickResource}
              />
            </div>
          </SectionCol>
          <SectionCol sm={2}>
            <PreviewContainer style={{float: 'right'}}>
              {isPreviewLoading ? (
                <Spin indicator={PreviewLoadingIcon} />
              ) : isHovered ? (
                <Tooltip
                  mouseEnterDelay={TOOLTIP_DELAY}
                  title={previewButtonActive ? ExitKustomizationPreviewTooltip : KustomizationPreviewTooltip}
                >
                  <PreviewSpan isSelected={isSelected} onClick={onClickPreview}>
                    {previewButtonActive ? 'Exit' : 'Preview'}
                  </PreviewSpan>
                </Tooltip>
              ) : null}
            </PreviewContainer>
          </SectionCol>
        </ItemRow>
      </StyledDiv>
    </RowContainer>
  );
};

export default NavigatorKustomizationRow;
