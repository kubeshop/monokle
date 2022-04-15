import {useMemo} from 'react';

import {Breadcrumb, Typography} from 'antd';

import {sortBy} from 'lodash';
import styled from 'styled-components';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {PreviewConfigValuesFileItem} from '@models/appconfig';

import {useAppSelector} from '@redux/hooks';
import {kubeConfigContextSelector} from '@redux/selectors';

import {buildHelmCommand} from '@utils/helm';

const {Text} = Typography;

const Container = styled.div`
  padding: 12px;
`;

const PreviwConfigurationDetails: React.FC = () => {
  const previewConfigurationMap = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap);
  const selectedPreviewConfigurationId = useAppSelector(state => state.main.selectedPreviewConfigurationId);

  const currentContext = useAppSelector(kubeConfigContextSelector);
  const rootFolderPath = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY].filePath);

  const previewConfiguration = useMemo(
    () =>
      selectedPreviewConfigurationId && previewConfigurationMap
        ? previewConfigurationMap[selectedPreviewConfigurationId]
        : undefined,
    [selectedPreviewConfigurationId, previewConfigurationMap]
  );

  const helmChart = useAppSelector(state => {
    if (!previewConfiguration) {
      return undefined;
    }
    return Object.values(state.main.helmChartMap).find(
      chart => chart.filePath === previewConfiguration.helmChartFilePath
    );
  });

  const orderedValuesFilePaths = useMemo(
    () =>
      previewConfiguration
        ? sortBy(
            Object.values(previewConfiguration.valuesFileItemMap).filter(
              (item): item is PreviewConfigValuesFileItem => item != null && item.isChecked
            ),
            ['order']
          ).map(i => i.filePath)
        : [],
    [previewConfiguration]
  );

  const builtCommand = useMemo(() => {
    if (!previewConfiguration || !helmChart) {
      return [''];
    }

    return buildHelmCommand(
      helmChart,
      orderedValuesFilePaths,
      previewConfiguration.command,
      previewConfiguration.options,
      rootFolderPath,
      currentContext
    );
  }, [previewConfiguration, helmChart, currentContext, rootFolderPath, orderedValuesFilePaths]);

  if (!previewConfiguration || !helmChart) {
    return (
      <Container>
        <p>Something went wrong...</p>
      </Container>
    );
  }

  return (
    <Container>
      {helmChart && previewConfiguration && (
        <Breadcrumb style={{marginBottom: 12}}>
          <Breadcrumb.Item>{helmChart.name}</Breadcrumb.Item>
          <Breadcrumb.Item>{previewConfiguration.name}</Breadcrumb.Item>
        </Breadcrumb>
      )}
      <Text code copyable>
        {builtCommand.join(' ')}
      </Text>
    </Container>
  );
};

export default PreviwConfigurationDetails;
