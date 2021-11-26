import {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {Menu, Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {ResourceMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';
import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {removeResource} from '@redux/reducers/main';
import {openNewResourceWizard, openRenameResourceModal} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {isFileResource, isUnsavedResource} from '@redux/services/resource';
import {AppDispatch} from '@redux/store';

import {Dots} from '@atoms';

import ContextMenu from '@components/molecules/ContextMenu';

import Colors from '@styles/Colors';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
  margin-right: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
`;

function deleteResourceWithConfirm(resource: K8sResource, resourceMap: ResourceMapType, dispatch: AppDispatch) {
  let title = `Are you sure you want to delete ${resource.name}?`;

  if (isFileResource(resource)) {
    const resourcesFromPath = getResourcesForPath(resource.filePath, resourceMap);
    if (resourcesFromPath.length === 1) {
      title = `This action will delete the ${resource.filePath} file.\n${title}`;
    }
  } else if (!isUnsavedResource(resource)) {
    title = `This action will delete the resource from the Cluster.\n${title}`;
  }

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        dispatch(removeResource(resource.id));
        resolve({});
      });
    },
    onCancel() {},
  });
}

const ResourceKindContextMenu = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const isResourceSelected = useMemo(() => {
    return itemInstance.id === selectedResourceId;
  }, [itemInstance, selectedResourceId]);

  if (!resource) {
    return null;
  }

  const onClickRename = () => {
    dispatch(openRenameResourceModal(resource.id));
  };

  const onClickClone = () => {
    dispatch(
      openNewResourceWizard({
        defaultInput: {
          name: resource.name,
          kind: resource.kind,
          apiVersion: resource.version,
          namespace: resource.namespace,
          selectedResourceId: resource.id,
        },
      })
    );
  };

  const onClickDelete = () => {
    deleteResourceWithConfirm(resource, resourceMap, dispatch);
  };

  const menu = (
    <Menu>
      <Menu.Item disabled={isInPreviewMode} onClick={onClickRename} key="rename">
        Rename
      </Menu.Item>
      <Menu.Item disabled={isInPreviewMode} onClick={onClickClone} key="clone">
        Clone
      </Menu.Item>
      <Menu.Item disabled={isInPreviewMode && previewType !== 'cluster'} onClick={onClickDelete} key="delete">
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <ContextMenu overlay={menu}>
      <StyledActionsMenuIconContainer isSelected={itemInstance.isSelected}>
        <Dots color={isResourceSelected ? Colors.blackPure : undefined} />
      </StyledActionsMenuIconContainer>
    </ContextMenu>
  );
};

export default ResourceKindContextMenu;
