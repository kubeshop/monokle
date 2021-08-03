import React from 'react';
import {Col, Row} from 'antd';
import styled from 'styled-components';
import {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';

import Colors, {FontColors} from '@styles/Colors';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {useSelector} from 'react-redux';
import {selectHelmValues} from '@redux/selectors';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {startPreview} from '@redux/utils/preview';
import ScrollIntoView from '@molecules/ScrollIntoView';

export type NavigatorHelmRowProps = {
  rowKey: React.Key;
  helmChart: HelmChart;
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    font-variant: tabular-nums;
    font-size: 15px;
    font-style: normal;
    font-weight: bold;
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
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

const NavigatorHelmRow = (props: NavigatorHelmRowProps) => {
  const helmValues = useSelector(selectHelmValues);
  const previewValuesFile = useAppSelector(state => state.main.previewValuesFile);
  const selectedValuesFile = useAppSelector(state => state.main.selectedValuesFile);
  const selectedPath = useAppSelector( state => state.main.selectedPath);
  const dispatch = useAppDispatch();
  const scrollContainer = React.useRef(null);

  const {rowKey, helmChart} = props;

  // Parent needs to make sure disabled and selected arent active at the same time.
  let chartClassName = `helmchart-row`;

  function onSelectValuesFile(id: string) {
    if (!previewValuesFile || previewValuesFile === id) {
      dispatch(selectHelmValuesFile(id));
    }
  }

  function onClickPreview(id: string) {
    if (!previewValuesFile || previewValuesFile === id) {
      if (id !== selectedValuesFile) {
        dispatch(selectHelmValuesFile(id));
      }
      startPreview(id, 'helm', dispatch);
    }
  }

  React.useEffect(() => {
    if (selectedPath && Object.values(helmValues).some(helm => helm.selected)) {
      // @ts-ignore
      scrollContainer.current?.scrollIntoView();
    }
  }, [helmValues,selectedPath]);

  return (
    <RowContainer>
      <ChartContainer className={chartClassName}>
        <ItemRow key={rowKey}>
          <SectionCol sm={22}>
            <ScrollIntoView ref={scrollContainer}>
              <div className={chartClassName}>{helmChart.name}</div>
            </ScrollIntoView>
          </SectionCol>
        </ItemRow>
      </ChartContainer>
      <TreeContainer className={chartClassName}>
        {helmChart.valueFiles
          .map(v => helmValues[v])
          .map((valuesFile: HelmValuesFile) => {
            const previewButtonActive = previewValuesFile !== undefined && previewValuesFile === valuesFile.id;
            const isDisabled = Boolean(previewValuesFile && previewValuesFile !== valuesFile.id);

            let valuesClassName = `helmvalues-row\
              ${valuesFile.selected ? ` helmvalues-row-selected` : ''}\
              ${isDisabled ? ` helmvalues-row-disabled` : ''}`;

            return (
              <ItemRow key={valuesFile.id} className={valuesClassName}>
                <SectionCol sm={22}>
                  <div onClick={() => onSelectValuesFile(valuesFile.id)}>{valuesFile.name}</div>
                </SectionCol>
                <SectionCol sm={2}>
                  {previewButtonActive ? (
                    <EyeInvisibleOutlined onClick={() => onClickPreview(valuesFile.id)} />
                  ) : (
                    <EyeOutlined onClick={() => onClickPreview(valuesFile.id)} />
                  )}
                </SectionCol>
              </ItemRow>
            );
          })}
      </TreeContainer>
    </RowContainer>
  );
};

export default NavigatorHelmRow;
