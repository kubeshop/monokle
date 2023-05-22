import {Dots} from '@atoms';
import {K8sResource} from '@shared/models/k8sResource';
import {Dropdown, MenuProps, Modal} from 'antd';
import {useMemo} from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import styled from 'styled-components';
import {Colors} from '@shared/styles/colors';
import {openScaleModal} from '@redux/reducers/ui';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import restartDeployment from '@redux/services/restartDeployment';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {deleteResourceHandler} from './utils';

type IProps = {
  resource: K8sResource<'cluster'>;
};

const ResourceActionsDropdown: React.FC<IProps> = props => {
  const {resource} = props;

  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);

  const isResourceDeployment = useMemo(() => resource.kind === 'Deployment', [resource.kind]);

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      {
        label: 'Scale',
        key: 'scale',
        onClick: e => {
          e.domEvent.stopPropagation();
          dispatch(openScaleModal(resource));
        },
        disabled: !isResourceDeployment,
      },
      {
        label: 'Restart',
        key: 'restart',
        onClick: e => {
          e.domEvent.stopPropagation();
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
        },
        disabled: !isResourceDeployment,
      },
      {
        label: <DeleteLabel>Delete</DeleteLabel>,
        key: 'delete',
        onClick: e => {
          e.domEvent.stopPropagation();
          deleteResourceHandler(dispatch, resource);
        },
      },
    ],
    [currentContext, dispatch, isResourceDeployment, kubeConfigPath, resource]
  );

  return (
    <Dropdown menu={{items: menuItems}} trigger={['click']}>
      <div
        style={{padding: '0px 5px', height: '100%', width: '100%'}}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <Dots />
      </div>
    </Dropdown>
  );
};

export default ResourceActionsDropdown;

// Styled Component

const DeleteLabel = styled.span`
  color: ${Colors.red5};
`;
