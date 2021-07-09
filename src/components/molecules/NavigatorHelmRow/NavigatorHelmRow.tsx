import React from 'react';
import {Col, Row} from 'antd';
import styled from 'styled-components';
import {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';

import Colors, {FontColors} from '@styles/Colors';
import {K8sResource} from '@models/k8sresource';
import {generateId} from '@utils/numberUtils';

export type NavigatorHelmRowProps = {
  rowKey: React.Key;
  resource: K8sResource;
  isSelected: boolean;
  isDisabled: boolean;
  highlighted: boolean;
  previewButtonActive: boolean;
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
  & .helmchart-row {
    width: 100%;
    padding-left: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    font-variant: tabular-nums;
    font-size: 12px;
    font-style: normal;
    font-weight: normal;
    line-height: 22px;
    color: ${FontColors.darkThemeMainFont};
  }
  & .helmchart-row-selected {
    background: ${Colors.selectionGradient};
    font-weight: bold;
    color: black;
  }
  & .helmchart-row-disabled {
    color: grey;
  }
  & .helmchart-row-highlighted {
    font-style: italic;
    font-weight: bold;
    background: ${Colors.highlightGradient};
    color: ${FontColors.resourceRowHighlight};
  }
  & .helmvalues-row {
    width: 100%;
    padding-left: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    font-variant: tabular-nums;
    font-size: 12px;
    font-style: normal;
    font-weight: normal;
    line-height: 22px;
    color: ${FontColors.darkThemeMainFont};
  }
  & .helmvalues-row-selected {
    background: ${Colors.selectionGradient};
    font-weight: bold;
    color: black;
  }
  & .helmvalues-row-disabled {
    color: grey;
  }
  & .helmvalues-row-highlighted {
    font-style: italic;
    font-weight: bold;
    background: ${Colors.highlightGradient};
    color: ${FontColors.resourceRowHighlight};
  }
`;

const ChartContainer = styled.div`
  width: 100%;
`;

const TreeContainer = styled.div`
  width: 100%;
  padding-left: 16px;
`;

/*

[
  helmObject1: {
    helmChart: {
      fileName: ...,
      ...helmChartProperties,
      isSelected: false,
    },
    valueFilesMatchedWithChart: [
      {
        fileName: ...,
        isSelected: false,
        ...
      }
    ],
  }
]
*/

const NavigatorHelmRow = (props: NavigatorHelmRowProps) => {
  const {
    rowKey,
    resource,
    isSelected,
    isDisabled,
    highlighted,
    previewButtonActive,
    onClickResource,
    onClickPreview,
  } = props;

  // Parent needs to make sure disabled and selected arent active at the same time.
  let chartClassName = `helmchart-row\
    ${isSelected ? ` helmchart-row-selected` : ''}\
    ${isDisabled ? ` helmchart-row-disabled` : ''}\
    ${highlighted ? ` helmchart-row-highlighted` : ''}`;

  const treeData = [
    {
      title: 'values.yaml',
      key: '1',
      children: [],
    },
    {
      title: 'values-local.yaml',
      key: '2',
      children: [],
    },
    {
      title: 'override.yaml',
      key: '3',
      children: [],
    },
  ];

  return (<RowContainer>
    <ChartContainer className={chartClassName}>
      <ItemRow key={rowKey}>
        <SectionCol sm={22}>
          <div
            className={chartClassName}
            onClick={onClickResource}
          >
            {resource.name}
          </div>
        </SectionCol>
      </ItemRow>

    </ChartContainer>
    <TreeContainer className={chartClassName}>
      {
        treeData
          .map((node: any) => {
            const valuesClassName = `helmvalues-row\
              ${node.isSelected ? ` helmvalues-row-selected` : ''}\
              ${node.isDisabled ? ` helmvalues-row-disabled` : ''}\
              ${node.highlighted ? ` helmvalues-row-highlighted` : ''}`;

            return (
              <ItemRow key={generateId('helmvalues-row')}>
                <SectionCol sm={22}>
                  <div
                    className={valuesClassName}
                    onClick={onClickResource}
                  >
                    {node.title}
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
            );
          }
        )
      }
    </TreeContainer>
  </RowContainer>);
};

export default NavigatorHelmRow;
