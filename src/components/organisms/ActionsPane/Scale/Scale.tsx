import {useEffect, useMemo, useState} from 'react';

import {Button, Col, InputNumber, Modal, Row, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ScaleTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeScaleModal, openScaleModal} from '@redux/reducers/ui';
import {
  isInClusterModeSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  selectedResourceSelector,
} from '@redux/selectors';
import {restartPreview} from '@redux/services/preview';
import scaleDeployment from '@redux/services/scaleDeployment';

const Scale = () => {
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const currentResource = useAppSelector(selectedResourceSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isScaleModalOpen = useAppSelector(state => state.ui.isScaleModalOpen);

  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const {name, namespace, kind} = currentResource || {};

  const isBtnEnabled = useMemo(() => kind === 'Deployment' && isInClusterMode, [kind, isInClusterMode]);
  const defaultReplica = useMemo(() => currentResource?.content?.spec?.replicas, [currentResource]);

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
      restartPreview(currentContext, 'cluster', dispatch);
    }
    dispatch(closeScaleModal());
  };

  useEffect(() => {
    setReplicas(defaultReplica);
  }, [defaultReplica]);

  return (
    <>
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ScaleTooltip} placement="bottomLeft">
        <Button
          loading={Boolean(scaling)}
          type="primary"
          size="small"
          onClick={() => dispatch(openScaleModal())}
          disabled={!isBtnEnabled}
          ghost
        >
          Scale
        </Button>
      </Tooltip>
      <Modal title="Set number of replicas" visible={isScaleModalOpen} onOk={handleScaleOk} onCancel={handleCancel}>
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
