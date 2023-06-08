import {useMemo} from 'react';

import {Modal, Tooltip} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {RestartTooltip} from '@constants/tooltips';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import restartDeployment from '@redux/services/restartDeployment';

import {PrimaryButton} from '@atoms';

import {isInClusterModeSelector} from '@shared/utils/selectors';
import {trackEvent} from '@shared/utils/telemetry';

const Restart: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const currentResource = useSelectedResource();
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
          trackEvent('cluster/actions/restart');
          restartDeployment({currentContext, kubeConfigPath, name, namespace});
          // TODO: we should have a way of updating a single resource instead of restarting the whole cluster
          dispatch(connectCluster({context: currentContext, namespace, reload: true}));
        }
      },
      onCancel() {},
    });
  };

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={RestartTooltip} placement="bottomLeft">
      <PrimaryButton type="link" size="small" onClick={handleClick} disabled={!isBtnEnabled}>
        Restart
      </PrimaryButton>
    </Tooltip>
  );
};

export default Restart;
