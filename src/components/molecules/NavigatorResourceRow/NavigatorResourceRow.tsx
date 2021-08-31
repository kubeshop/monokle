import React from 'react';
import {Col, Row} from 'antd';
import styled from 'styled-components';
import Colors, {FontColors} from '@styles/Colors';
import NavigatorRowLabel from '@molecules/NavigatorRowLabel';
import {ResourceValidationError} from '@models/k8sresource';

export type NavigatorResourceRowProps = {
  rowKey: React.Key;
  label: string;
  isSelected: boolean;
  highlighted: boolean;
  hasIncomingRefs: boolean;
  hasOutgoingRefs: boolean;
  hasUnsatisfiedRefs: boolean;
  onClickResource?: React.MouseEventHandler<HTMLDivElement>;
  showErrorsModal?: (errors: ResourceValidationError[]) => void;
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
  & .resource-row {
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
  & .resource-row-selected {
    background: ${Colors.selectionGradient};
    font-weight: bold;
    color: black;
  }
  & .resource-row-disabled {
    color: grey;
  }
  & .resource-row-highlighted {
    font-weight: bold;
    background: ${Colors.highlightGradient};
    color: ${FontColors.resourceRowHighlight};
  }
`;

const StyledDiv = styled.div`
  width: 100%;
`;

const NavigatorResourceRow = (props: NavigatorResourceRowProps) => {
  const {
    rowKey,
    label,
    isSelected,
    highlighted,
    hasIncomingRefs,
    hasOutgoingRefs,
    hasUnsatisfiedRefs,
    onClickResource,
    showErrorsModal,
  } = props;

  // Parent needs to make sure disabled and selected arent active at the same time.
  let classname = `resource-row\
    ${isSelected ? ` resource-row-selected` : ''}\
    ${highlighted ? ` resource-row-highlighted` : ''}`;

  return (
    <RowContainer>
      <StyledDiv className={classname}>
        <ItemRow key={rowKey}>
          <SectionCol sm={22}>
            <div className={classname}>
              <NavigatorRowLabel
                label={label}
                isSelected={isSelected}
                isHighlighted={highlighted}
                resourceId={rowKey.toString()}
                hasIncomingRefs={hasIncomingRefs}
                hasOutgoingRefs={hasOutgoingRefs}
                hasUnsatisfiedRefs={hasUnsatisfiedRefs}
                onClickLabel={onClickResource}
                showErrorsModal={showErrorsModal}
              />
            </div>
          </SectionCol>
        </ItemRow>
      </StyledDiv>
    </RowContainer>
  );
};

export default NavigatorResourceRow;
