import {useMemo} from 'react';

import {Dropdown, MenuProps} from 'antd';

import styled from 'styled-components';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openScaleModal} from '@redux/reducers/ui';

import {Dots} from '@atoms';

import {K8sResource} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles/colors';

import {deleteResourceHandler, restartResourceHandler} from './utils';

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
          restartResourceHandler(dispatch, currentContext, kubeConfigPath, resource);
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
