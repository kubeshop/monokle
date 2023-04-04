import {useMemo} from 'react';

import {Breadcrumb, Typography} from 'antd';

import {sortBy} from 'lodash';

import {kubeConfigContextSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {buildHelmCommand} from '@utils/helm';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {PreviewConfigValuesFileItem} from '@shared/models/config';

import * as S from './PreviewConfigurationDetails.styled';

const {Text} = Typography;

const PreviwConfigurationDetails: React.FC = () => {
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const previewConfigurationMap = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap);
  const rootFolderPath = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY].filePath);
  const selection = useAppSelector(state => state.main.selection);

  const selectedPreviewConfigurationId = useMemo(() => {
    if (selection?.type !== 'preview.configuration') {
      return undefined;
    }

    return selection.previewConfigurationId;
  }, [selection]);

  const previewConfiguration = useMemo(
    () =>
      selectedPreviewConfigurationId && previewConfigurationMap
        ? previewConfigurationMap[selectedPreviewConfigurationId]
        : undefined,
    [selectedPreviewConfigurationId, previewConfigurationMap]
  );

  const helmChart = useMemo(() => {
    if (!previewConfiguration) {
      return undefined;
    }

    return Object.values(helmChartMap).find(chart => chart.filePath === previewConfiguration.helmChartFilePath);
  }, [helmChartMap, previewConfiguration]);

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
      <S.Container>
        <p>Something went wrong...</p>
      </S.Container>
    );
  }

  return (
    <S.Container>
      {helmChart && previewConfiguration && (
        <Breadcrumb style={{marginBottom: 12}}>
          <Breadcrumb.Item>{helmChart.name}</Breadcrumb.Item>
          <Breadcrumb.Item>{previewConfiguration.name}</Breadcrumb.Item>
        </Breadcrumb>
      )}
      <Text code copyable>
        {builtCommand.join(' ')}
      </Text>
    </S.Container>
  );
};

export default PreviwConfigurationDetails;
