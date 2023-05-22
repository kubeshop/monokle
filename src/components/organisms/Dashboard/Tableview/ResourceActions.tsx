import {ExclamationCircleOutlined} from '@ant-design/icons';
import {SecondaryButton} from '@atoms';
import Restart from '@components/organisms/ActionsPane/Restart/Restart';
import Scale from '@components/organisms/ActionsPane/Scale/Scale';

import {setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {editorHasReloadedSelectedPath} from '@redux/reducers/main';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {applyResourceToCluster} from '@redux/thunks/applyResource';

import {removeResources} from '@redux/thunks/removeResources';
import {AlertEnum} from '@shared/models/alert';
import {K8sResource} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles';
import {Modal} from 'antd';
import {useCallback} from 'react';

import styled from 'styled-components';

type IProps = {
  resource?: K8sResource<'cluster'>;
};

const ResourceActions: React.FC<IProps> = props => {
  const {resource} = props;

  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.dashboard.ui.activeTab);
  const clusterResourceMetaMap = useResourceMetaMap('cluster');
  const isApplyingResource = useAppSelector(state => state.main.isApplyingResource);

  const deleteResourceHandler = useCallback(() => {
    if (!resource) return;

    Modal.confirm({
      title: `This action will delete the resource from the Cluster.\n Are you sure you want to delete ${resource.name}?`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        return new Promise(resolve => {
          dispatch(removeResources([resource]));
          dispatch(editorHasReloadedSelectedPath(true));
          dispatch(setDashboardSelectedResourceId());
          dispatch(setAlert({title: 'Resource deleted from the cluster', message: '', type: AlertEnum.Success}));
          resolve({});
        });
      },
      onCancel() {},
    });
  }, [dispatch, resource]);

  const handleApplyResource = () => {
    if (!resource || !resource.namespace || !clusterResourceMetaMap[resource.id]) return;

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
  };

  return (
    <Container>
      {activeTab === 'Manifest' && (
        <Button onClick={handleApplyResource} disabled={!resource} loading={isApplyingResource}>
          Update
        </Button>
      )}

      <Scale clusterDashboardStyling />
      <Restart clusterDashboardStyling />

      <Button onClick={deleteResourceHandler} $delete>
        Delete
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
      return `color: ${Colors.redError}`;
    }
  }}
`;
