import {useMemo} from 'react';

import {Breadcrumb, Typography} from 'antd';

import {sortBy} from 'lodash';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {PreviewConfigValuesFileItem} from '@models/appconfig';

import {useAppSelector} from '@redux/hooks';
import {kubeConfigContextSelector} from '@redux/selectors';

import {buildHelmCommand} from '@utils/helm';

import * as S from './PreviewConfigurationDetails.styled';

const {Text} = Typography;

const PreviwConfigurationDetails: React.FC = () => {
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const previewConfigurationMap = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap);
  const rootFolderPath = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY].filePath);
  const selectedPreviewConfigurationId = useAppSelector(state => state.main.selectedPreviewConfigurationId);

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
