import {useMemo} from 'react';

import {Select, Tooltip} from 'antd';

import {orderBy} from 'lodash';
import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPreviewConfigurationEditorHelmChartId} from '@redux/reducers/main';

import {Colors} from '@shared/styles/colors';

const HelmChartSelect: React.FC = () => {
  const dispatch = useAppDispatch();
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const editorHelmChartId = useAppSelector(state => state.main.prevConfEditor.helmChartId);
  const previewConfigurationId = useAppSelector(state => state.main.prevConfEditor.previewConfigurationId);

  const orderedHelmChartMap = useMemo(() => orderBy(helmChartMap, ['name'], ['asc']), [helmChartMap]);

  return (
    <>
      <span>Helm Chart</span>

      <Select
        style={{display: 'block', margin: '4px 0px 15px 0px'}}
        disabled={Boolean(previewConfigurationId)}
        placeholder="Select a Helm chart"
        showSearch
        onChange={value => dispatch(setPreviewConfigurationEditorHelmChartId(value))}
        value={editorHelmChartId}
      >
        {orderedHelmChartMap.map(chart => (
          <Select.Option key={chart.id} value={chart.id}>
            {chart.name}
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={chart.filePath}>
              <FilePath>{chart.filePath}</FilePath>
            </Tooltip>
          </Select.Option>
        ))}
      </Select>
    </>
  );
};

export default HelmChartSelect;

// Styled Components

const FilePath = styled.span`
  color: ${Colors.grey7};
  margin-left: 6px;
`;
