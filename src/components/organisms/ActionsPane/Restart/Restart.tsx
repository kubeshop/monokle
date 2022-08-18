import {useMemo} from 'react';

import {Button, Modal, Tooltip} from 'antd';

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
      <Button type="primary" size="small" ghost onClick={handleClick} disabled={!isBtnEnabled}>
        Restart
      </Button>
    </Tooltip>
  );
};

export default Restart;
