import {useMemo} from 'react';

import {Modal} from 'antd';

import {DeleteOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openScaleModal} from '@redux/reducers/ui';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {applyResourceToCluster} from '@redux/thunks/applyResource';

import {SecondaryButton} from '@atoms';

import {K8sResource} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils/telemetry';

import {deleteResourceHandler, restartResourceHandler} from './utils';

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
        trackEvent('cluster/actions/update_manifest', {kind: resource.kind});
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
        onClick={() => restartResourceHandler(dispatch, currentContext, kubeConfigPath, resource)}
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
