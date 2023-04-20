import {useEffect, useMemo, useState} from 'react';

import {Col, InputNumber, Modal, Row, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ScaleTooltip} from '@constants/tooltips';

import {isInClusterModeSelector, kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeScaleModal, openScaleModal} from '@redux/reducers/ui';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import scaleDeployment from '@redux/services/scaleDeployment';

import {PrimaryButton} from '@atoms';

const Scale: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const currentResource = useSelectedResource();
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isScaleModalOpen = useAppSelector(state => state.ui.isScaleModalOpen);

  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const {name, namespace, kind} = currentResource || {};

  const isBtnEnabled = useMemo(() => kind === 'Deployment' && isInClusterMode, [kind, isInClusterMode]);
  const defaultReplica = useMemo(() => currentResource?.object?.spec?.replicas, [currentResource]);

  const [replicas, setReplicas] = useState<number>(defaultReplica);
  const [scaling, toggleScaling] = useState(false);

  const handleCancel = () => {
    dispatch(closeScaleModal());
  };

  const handleScaleOk = async () => {
    if (name && namespace) {
      toggleScaling(true);
      await scaleDeployment({name, replicas, namespace, currentContext, kubeConfigPath});
      toggleScaling(false);
      // TODO: we should have a way of updating a single resource instead of restarting the whole cluster
      dispatch(connectCluster({context: currentContext, namespace, reload: true}));
    }
    dispatch(closeScaleModal());
  };

  useEffect(() => {
    setReplicas(defaultReplica);
  }, [defaultReplica]);

  return (
    <>
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ScaleTooltip} placement="bottomLeft">
        <PrimaryButton
          loading={Boolean(scaling)}
          type="link"
          size="small"
          onClick={() => dispatch(openScaleModal())}
          disabled={!isBtnEnabled}
        >
          Scale
        </PrimaryButton>
      </Tooltip>

      <Modal title="Set number of replicas" open={isScaleModalOpen} onOk={handleScaleOk} onCancel={handleCancel}>
        <Row style={{alignItems: 'center'}}>
          <Col span={8}>
            <span>Number of replicas</span>
          </Col>
          <Col span={16}>
            <InputNumber
              controls={false}
              type="number"
              value={replicas}
              onChange={val => {
                if (!val) {
                  return;
                }

                setReplicas(val);
              }}
            />
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default Scale;
