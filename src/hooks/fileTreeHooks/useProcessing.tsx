import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectConfig} from '@redux/reducers/appConfig';
import {scanExcludesSelector} from '@redux/selectors';

export const useProcessing = (onOkHandler: () => void) => {
  const scanExcludes = useAppSelector(scanExcludesSelector);
  const configState = useAppSelector(state => state.config);
  const dispatch = useAppDispatch();

  const openConfirmModal = () => {
    Modal.confirm({
      title: 'You should reload the file explorer to have your changes applied. Do you want to do it now?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Not now',
      onOk: () => {
        onOkHandler();
      },
    });
  };

  const onExcludeFromProcessing = (relativePath: string) => {
    dispatch(
      updateProjectConfig({
        config: {
          ...configState.projectConfig,
          scanExcludes: [...scanExcludes, relativePath],
        },
        fromConfigFile: false,
      })
    );
    openConfirmModal();
  };

  const onIncludeToProcessing = (relativePath: string) => {
    dispatch(
      updateProjectConfig({
        config: {
          ...configState.projectConfig,
          scanExcludes: scanExcludes.filter(scanExclude => scanExclude !== relativePath),
        },
        fromConfigFile: false,
      })
    );
    openConfirmModal();
  };

  return {onExcludeFromProcessing, onIncludeToProcessing};
};
