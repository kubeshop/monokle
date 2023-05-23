import {useState} from 'react';

import {Col, InputNumber, Modal, Row} from 'antd';

import {currentKubeContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeScaleModal} from '@redux/reducers/ui';
import scaleDeployment from '@redux/services/scaleDeployment';

import {trackEvent} from '@shared/utils/telemetry';

const ScaleModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {isOpen, resource} = useAppSelector(state => state.ui.scaleModal);
  const currentContext = useAppSelector(currentKubeContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);

  const [replicas, setReplicas] = useState<number>(resource?.object?.spec?.replicas);

  const handleScaleOk = async () => {
    if (!resource || !resource.name || !resource.namespace) {
      dispatch(closeScaleModal());
      return;
    }

    trackEvent('cluster/actions/scale', {replicasNumber: replicas});

    await scaleDeployment({
      name: resource.name,
      replicas,
      namespace: resource.namespace,
      currentContext,
      kubeConfigPath,
    });

    // TODO: we should have a way of updating a single resource instead of restarting the whole cluster
    dispatch(connectCluster({context: currentContext, namespace: resource.namespace, reload: true}));
    dispatch(closeScaleModal());
  };

  const handleCancel = () => {
    dispatch(closeScaleModal());
  };

  return (
    <Modal title="Set number of replicas" open={isOpen} onOk={handleScaleOk} onCancel={handleCancel}>
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
  );
};

export default ScaleModal;
