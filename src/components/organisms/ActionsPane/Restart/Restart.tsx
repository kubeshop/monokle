import {useMemo} from 'react';

import {Modal, Tooltip} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {RestartTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  isInClusterModeSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  selectedResourceSelector,
} from '@redux/selectors';
import {restartPreview} from '@redux/services/preview';
import restartDeployment from '@redux/services/restartDeployment';

import {SecondaryButton} from '@atoms';

const Restart = () => {
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const currentResource = useAppSelector(selectedResourceSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);

  const {name, namespace, kind} = currentResource || {};

  const isBtnEnabled = useMemo(() => kind === 'Deployment' && isInClusterMode, [kind, isInClusterMode]);

  const handleClick = () => {
    Modal.confirm({
      title: 'Do you want to restart the deployment?',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        if (name && namespace) {
          restartDeployment({currentContext, kubeConfigPath, name, namespace});
          restartPreview(currentContext, 'cluster', dispatch);
        }
      },
      onCancel() {},
    });
  };

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={RestartTooltip} placement="bottomLeft">
      <SecondaryButton type="default" size="small" onClick={handleClick} disabled={!isBtnEnabled}>
        Restart
      </SecondaryButton>
    </Tooltip>
  );
};

export default Restart;
