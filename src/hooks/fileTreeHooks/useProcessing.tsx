import {useCallback} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {scanExcludesSelector, updateProjectConfig} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {useRefSelector} from '@utils/hooks';

export const useProcessing = (onOkHandler: () => void) => {
  const scanExcludes = useAppSelector(scanExcludesSelector);
  const projectConfigRef = useRefSelector(state => state.config.projectConfig);
  const dispatch = useAppDispatch();

  const openConfirmModal = useCallback(() => {
    Modal.confirm({
      title: 'You should reload the file explorer to have your changes applied. Do you want to do it now?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Not now',
      onOk: () => {
        onOkHandler();
      },
    });
  }, [onOkHandler]);

  const onExcludeFromProcessing = useCallback(
    (relativePath: string) => {
      dispatch(
        updateProjectConfig({
          config: {
            ...projectConfigRef.current,
            scanExcludes: [...scanExcludes, relativePath],
          },
          fromConfigFile: false,
        })
      );
      openConfirmModal();
    },
    [dispatch, openConfirmModal, scanExcludes, projectConfigRef]
  );

  const onIncludeToProcessing = (relativePath: string) => {
    dispatch(
      updateProjectConfig({
        config: {
          ...projectConfigRef.current,
          scanExcludes: scanExcludes.filter(scanExclude => scanExclude !== relativePath),
        },
        fromConfigFile: false,
      })
    );
    openConfirmModal();
  };

  return {onExcludeFromProcessing, onIncludeToProcessing};
};
