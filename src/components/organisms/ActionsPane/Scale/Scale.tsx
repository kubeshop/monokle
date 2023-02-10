import {useEffect, useMemo, useState} from 'react';

import {Col, InputNumber, Modal, Row, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ScaleTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeScaleModal, openScaleModal} from '@redux/reducers/ui';
import {isInClusterModeSelector, kubeConfigPathSelector} from '@redux/selectors';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import scaleDeployment from '@redux/services/scaleDeployment';
import {startClusterConnection} from '@redux/thunks/cluster';

import {SecondaryButton} from '@atoms';

import {kubeConfigContextSelector} from '@shared/utils/selectors';

type IProps = {
  isDropdownActive?: boolean;
};

const Scale: React.FC<IProps> = props => {
  const {isDropdownActive = false} = props;

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
      dispatch(startClusterConnection({context: currentContext, namespace, isRestart: true}));
    }
    dispatch(closeScaleModal());
  };

  useEffect(() => {
    setReplicas(defaultReplica);
  }, [defaultReplica]);

  return (
    <>
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ScaleTooltip} placement="bottomLeft">
        <SecondaryButton
          $disableHover={isDropdownActive}
          loading={Boolean(scaling)}
          type={isDropdownActive ? 'link' : 'default'}
          size="small"
          onClick={() => dispatch(openScaleModal())}
          disabled={!isBtnEnabled}
        >
          Scale
        </SecondaryButton>
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
