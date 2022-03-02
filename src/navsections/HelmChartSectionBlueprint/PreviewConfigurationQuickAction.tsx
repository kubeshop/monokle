import {useCallback} from 'react';

import {Button} from 'antd';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';

const PreviewConfigurationQuickAction: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();

  const previewConfiguration = useAppSelector(
    state => state.config.projectConfig?.helm?.previewConfigurationMap?.[itemInstance.id]
  );

  const helmChart = useAppSelector(state =>
    previewConfiguration
      ? Object.values(state.main.helmChartMap).find(h => h.filePath === previewConfiguration.helmChartFilePath)
      : undefined
  );

  const onClickRun = useCallback(() => {
    if (!previewConfiguration) {
      return;
    }
    dispatch(runPreviewConfiguration(previewConfiguration));
  }, [dispatch, previewConfiguration]);

  const onClickEdit = useCallback(() => {
    if (!previewConfiguration || !helmChart) {
      return;
    }
    dispatch(
      openPreviewConfigurationEditor({helmChartId: helmChart.id, previewConfigurationId: previewConfiguration.id})
    );
  }, [previewConfiguration, helmChart, dispatch]);

  if (!previewConfiguration || !helmChart) {
    return null;
  }

  return (
    <>
      <Button onClick={() => onClickRun()} type="link" size="small" style={{fontSize: 12}}>
        Run
      </Button>
      <Button onClick={() => onClickEdit()} type="link" size="small" style={{fontSize: 12}}>
        Edit
      </Button>
    </>
  );
};

export default PreviewConfigurationQuickAction;
