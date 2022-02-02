import React, {useCallback, useMemo, useState} from 'react';

import {Input, Menu, Modal} from 'antd';

import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {makeApplyMultipleResourcesText} from '@constants/makeApplyText';

import {AlertEnum} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {removeResource, uncheckAllResourceIds} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelector, kubeConfigContextSelector} from '@redux/selectors';
import {isUnsavedResource} from '@redux/services/resource';
import {applyCheckedResources} from '@redux/thunks/applyCheckedResources';

import Colors from '@styles/Colors';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';

export const SaveDestinationWrapper = styled(Input.Group)`
  display: flex !important;
`;

const StyledMenu = styled(Menu)`
  background: linear-gradient(90deg, #112a45 0%, #111d2c 100%);
  color: ${Colors.blue6};
  height: 40px;
  line-height: 1.57;
  display: flex;
  align-items: center;

  & .ant-menu-item {
    padding: 0 12px !important;
  }

  & .ant-menu-item::after {
    border-bottom: none !important;
  }

  & .ant-menu-item::after {
    left: 12px;
    right: 12px;
  }

  & li:first-child {
    color: ${Colors.grey7};
    cursor: default;
  }
`;

const deleteCheckedResourcesWithConfirm = (checkedResources: K8sResource[], dispatch: AppDispatch) => {
  let title = `Are you sure you want to delete the selected resources (${checkedResources.length}) ?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    centered: true,
    onOk() {
      let alertMessage = '';
      return new Promise(resolve => {
        checkedResources.forEach(resource => {
          dispatch(removeResource(resource.id));
          alertMessage += `${alertMessage && ' | '}${resource.name}\n`;
        });
        dispatch(uncheckAllResourceIds());

        dispatch(setAlert({type: AlertEnum.Success, title: 'Successfully deleted resources', message: alertMessage}));
        resolve({});
      });
    },
    onCancel() {},
  });
};

const CheckedResourcesActionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

  const areOnlyUnsavedResourcesChecked = useMemo(
    () => checkedResourceIds.every(resourceId => isUnsavedResource(resourceMap[resourceId])),
    [checkedResourceIds, resourceMap]
  );

  const checkedResources = useMemo(
    () => checkedResourceIds.map(resource => resourceMap[resource]).filter((r): r is K8sResource => r !== undefined),
    [checkedResourceIds, resourceMap]
  );

  const confirmModalTitle = useMemo(
    () => makeApplyMultipleResourcesText(checkedResources.length, kubeConfigContext),
    [checkedResources, kubeConfigContext]
  );

  const onClickDelete = useCallback(() => {
    const resourcesToDelete = checkedResourceIds
      .map(resource => resourceMap[resource])
      .filter((r): r is K8sResource => r !== undefined);

    deleteCheckedResourcesWithConfirm(resourcesToDelete, dispatch);
  }, [checkedResourceIds, dispatch, resourceMap]);

  const onClickDeployChecked = () => {
    setIsApplyModalVisible(true);
  };

  const onClickApplyCheckedResources = (namespace?: {name: string; new: boolean}) => {
    dispatch(applyCheckedResources(namespace));
    setIsApplyModalVisible(false);
  };

  const onClickUncheckAll = () => {
    dispatch(uncheckAllResourceIds());
  };

  const onClickSaveToFileFolder = () => {
    dispatch(openSaveResourcesToFileFolderModal(checkedResourceIds));
  };

  return (
    <>
      <StyledMenu mode="horizontal">
        <Menu.Item disabled key="selected_resources">
          {checkedResourceIds.length} Selected
        </Menu.Item>
        {(!isInPreviewMode || isInClusterMode) && (
          <Menu.Item style={{color: Colors.red7}} key="delete" onClick={onClickDelete}>
            Delete
          </Menu.Item>
        )}

        {!isInClusterMode && (
          <Menu.Item key="deploy" onClick={onClickDeployChecked}>
            Deploy
          </Menu.Item>
        )}

        {(isInPreviewMode || areOnlyUnsavedResourcesChecked) && (
          <Menu.Item key="save_to_file_folder" onClick={onClickSaveToFileFolder}>
            Save to file/folder
          </Menu.Item>
        )}

        <Menu.Item style={{marginLeft: 'auto'}} key="deselect" onClick={onClickUncheckAll}>
          <CloseOutlined />
        </Menu.Item>
      </StyledMenu>

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          resources={checkedResources}
          isVisible={isApplyModalVisible}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyCheckedResources(namespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default CheckedResourcesActionsMenu;
