import React, {useMemo, useState} from 'react';

import {Menu, Modal} from 'antd';

import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {uncheckAllResourceIds} from '@redux/reducers/main';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';
import {AppDispatch} from '@redux/store';
import {applyCheckedResources} from '@redux/thunks/applyCheckedResources';

import Colors from '@styles/Colors';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';

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
      return new Promise(resolve => {
        resolve({});
      });
    },
    onCancel() {},
  });
};

const CheckedResourcesActionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();

  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const currentContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const confirmModalTitle = useMemo(
    () => `Deploy selected resources (${checkedResourceIds.length}) to cluster [${currentContext || ''}]?`,
    [checkedResourceIds, currentContext]
  );

  const onClickDelete = () => {
    const resourcesToDelete = checkedResourceIds
      .map(resource => resourceMap[resource])
      .filter((r): r is K8sResource => r !== undefined);

    deleteCheckedResourcesWithConfirm(resourcesToDelete, dispatch);
  };

  const onClickDeployChecked = () => {
    setIsModalVisible(true);
  };

  const onClickApplyCheckedResources = () => {
    dispatch(applyCheckedResources());
    setIsModalVisible(false);
  };

  const onClickUncheckAll = () => {
    dispatch(uncheckAllResourceIds());
  };

  return (
    <StyledMenu mode="horizontal">
      <Menu.Item disabled key="resources-selected">
        {checkedResourceIds.length} Selected
      </Menu.Item>
      {!isInPreviewMode && (
        <Menu.Item style={{color: Colors.red7}} key="delete" onClick={onClickDelete}>
          Delete
        </Menu.Item>
      )}

      {!isInClusterMode && (
        <Menu.Item key="deploy" onClick={onClickDeployChecked}>
          Deploy
        </Menu.Item>
      )}

      <Menu.Item style={{marginLeft: 'auto'}} key="deselect" onClick={onClickUncheckAll}>
        <CloseOutlined />
      </Menu.Item>

      <ModalConfirmWithNamespaceSelect
        isModalVisible={isModalVisible}
        title={confirmModalTitle}
        onOk={onClickApplyCheckedResources}
        setIsModalVisible={value => setIsModalVisible(value)}
      />
    </StyledMenu>
  );
};

export default CheckedResourcesActionsMenu;
