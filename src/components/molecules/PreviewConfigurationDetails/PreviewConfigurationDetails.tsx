import {useMemo} from 'react';

import {Breadcrumb, Typography} from 'antd';

import {sortBy} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {buildHelmConfigCommand} from '@utils/helm';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {PreviewConfigValuesFileItem} from '@shared/models/config';

import * as S from './PreviewConfigurationDetails.styled';

const {Text} = Typography;

const PreviwConfigurationDetails: React.FC = () => {
  const previewConfigurationMap = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap);
  const rootFolderPath = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY].filePath);
  const selectedPreviewConfigurationId = useAppSelector(state =>
    state.main.selection?.type === 'preview.configuration' ? state.main.selection.previewConfigurationId : undefined
  );

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

    return buildHelmConfigCommand(
      helmChart,
      orderedValuesFilePaths,
      previewConfiguration.command,
      previewConfiguration.options,
      rootFolderPath
    );
  }, [previewConfiguration, helmChart, rootFolderPath, orderedValuesFilePaths]);

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
