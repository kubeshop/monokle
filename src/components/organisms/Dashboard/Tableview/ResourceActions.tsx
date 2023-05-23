import {useMemo} from 'react';

import {Modal} from 'antd';

import {DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openScaleModal} from '@redux/reducers/ui';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import restartDeployment from '@redux/services/restartDeployment';
import {applyResourceToCluster} from '@redux/thunks/applyResource';

import {SecondaryButton} from '@atoms';

import {K8sResource} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles';

import {deleteResourceHandler} from './utils';

type IProps = {
  resource?: K8sResource<'cluster'>;
};

const ResourceActions: React.FC<IProps> = props => {
  const {resource} = props;

  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.dashboard.ui.activeTab);
  const isApplyingResource = useAppSelector(state => state.main.isApplyingResource);
  const clusterResourceMetaMap = useResourceMetaMap('cluster');
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);

  const isResourceDeployment = useMemo(() => resource?.kind === 'Deployment', [resource?.kind]);

  const handleApplyResource = () => {
    if (!resource || !resource.namespace || !clusterResourceMetaMap[resource.id]) return;

    Modal.confirm({
      title: `Are you sure you want to update ${resource.name}?`,
      onOk() {
        dispatch(
          applyResourceToCluster({
            resourceIdentifier: {
              id: resource.id,
              storage: 'cluster',
            },
            namespace: resource.namespace ? {name: resource.namespace, new: false} : undefined,
            options: {
              isInClusterMode: true,
            },
          })
        );
      },
      onCancel() {},
    });
  };

  const handleRestartResource = () => {
    Modal.confirm({
      title: 'Do you want to restart the deployment?',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        if (!resource?.name || !resource?.namespace) return;

        restartDeployment({currentContext, kubeConfigPath, name: resource.name, namespace: resource.namespace});
        // TODO: we should have a way of updating a single resource instead of restarting the whole cluster
        dispatch(connectCluster({context: currentContext, namespace: resource.namespace, reload: true}));
      },
      onCancel() {},
    });
  };

  return (
    <Container>
      {activeTab === 'Manifest' && (
        <Button onClick={handleApplyResource} disabled={!resource} loading={isApplyingResource}>
          Update
        </Button>
      )}

      <Button
        onClick={() => {
          if (!resource) return;
          dispatch(openScaleModal(resource));
        }}
        disabled={!isResourceDeployment}
      >
        Scale
      </Button>

      <Button
        disabled={!isResourceDeployment}
        onClick={() => {
          if (!resource) return;
          handleRestartResource();
        }}
      >
        Restart
      </Button>

      <Button onClick={() => deleteResourceHandler(dispatch, resource)} $delete>
        <DeleteOutlined />
      </Button>
    </Container>
  );
};

export default ResourceActions;

// Styled Components

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled(SecondaryButton)<{$delete?: Boolean}>`
  font-size: 12px;
  border-radius: 2px;

  ${({$delete}) => {
    if ($delete) {
      return `
        font-size: 14px;
        color: ${Colors.red5};

        &:hover { 
          color: ${Colors.red5};
        }
      `;
    }
  }}
`;
