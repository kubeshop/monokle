import {useMemo} from 'react';

import {Modal, Tooltip} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {RestartTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {isInClusterModeSelector, kubeConfigPathSelector} from '@redux/selectors';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import restartDeployment from '@redux/services/restartDeployment';
import {startClusterConnection} from '@redux/thunks/cluster';

import {PrimaryButton} from '@atoms';

import {kubeConfigContextSelector} from '@shared/utils/selectors';

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
          restartDeployment({currentContext, kubeConfigPath, name, namespace});
          // TODO: we should have a way of updating a single resource instead of restarting the whole cluster
          dispatch(startClusterConnection({context: currentContext, namespace, isRestart: true}));
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
