import {useMemo} from 'react';

import {Popconfirm} from 'antd';

import {DeleteOutlined} from '@ant-design/icons';

import styled from 'styled-components';
import {parse as parseYaml} from 'yaml';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openScaleModal} from '@redux/reducers/ui';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {applyResourceToCluster} from '@redux/thunks/applyResource';

import {SecondaryButton} from '@atoms';

import {getEditor} from '@editor/editor.instance';
import {K8sResource} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils/telemetry';

import {deleteResourceHandler, restartResourceHandler} from './utils';

type IProps = {
  resource?: K8sResource<'cluster'>;
  isConfirmingUpdate: boolean;
  setIsConfirmingUpdate: (isConfirmingUpdate: boolean) => void;
};

const ResourceActions: React.FC<IProps> = props => {
  const {resource, isConfirmingUpdate, setIsConfirmingUpdate} = props;

  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.dashboard.ui.activeTab);
  const isApplyingResource = useAppSelector(state => state.main.isApplyingResource);
  const clusterResourceMetaMap = useResourceMetaMap('cluster');
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);

  const isResourceDeployment = useMemo(() => resource?.kind === 'Deployment', [resource?.kind]);

  const handleApplyResource = () => {
    const editor = getEditor();
    const updatedResourceText = editor?.getModel()?.getValue();

    if (!updatedResourceText || !resource || !resource.namespace || !clusterResourceMetaMap[resource.id]) return;

    const updatedResourceObject = parseYaml(updatedResourceText);

    trackEvent('cluster/actions/update_manifest', {kind: resource.kind});
    dispatch(
      applyResourceToCluster({
        resourceIdentifier: {
          id: resource.id,
          storage: 'cluster',
        },
        namespace: updatedResourceObject.metadata?.namespace
          ? {name: updatedResourceObject.metadata.namespace, new: false}
          : undefined,
        options: {
          isInClusterMode: true,
          providedResourceObject: updatedResourceObject,
        },
      })
    );
    setIsConfirmingUpdate(false);
  };

  return (
    <Container>
      {activeTab === 'Manifest' && (
        <Popconfirm
          open={isConfirmingUpdate}
          title={`Are you sure you want to update ${resource?.name}?`}
          placement="bottom"
          onConfirm={handleApplyResource}
          onCancel={() => setIsConfirmingUpdate(false)}
        >
          <Button onClick={() => setIsConfirmingUpdate(true)} disabled={!resource} loading={isApplyingResource}>
            Update
          </Button>
        </Popconfirm>
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
