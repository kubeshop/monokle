import React, {useCallback, useMemo, useState} from 'react';

import {Modal} from 'antd';

import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import {makeApplyMultipleResourcesText} from '@constants/makeApplyText';

import {AlertEnum} from '@models/alert';
import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {uncheckAllResourceIds} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelector, kubeConfigContextSelector} from '@redux/selectors';
import {isUnsavedResource} from '@redux/services/resource';
import {applyCheckedResources} from '@redux/thunks/applyCheckedResources';
import {removeResources} from '@redux/thunks/removeResources';

import Colors from '@styles/Colors';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';
import * as S from './CheckedResourcesActionMenu.styled';

const CheckedResourcesActionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

  const areOnlyUnsavedResourcesChecked = useMemo(
    () =>
      checkedResourceIds
        .map(resourceId => resourceMap[resourceId])
        .filter((resource): resource is K8sResource => resource !== undefined)
        .every(isUnsavedResource),
    [checkedResourceIds, resourceMap]
  );

  const checkedResources = useMemo(() => {
    return checkedResourceIds.map(resource => resourceMap[resource]).filter((r): r is K8sResource => r !== undefined);
  }, [checkedResourceIds, resourceMap]);

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

  const menuItems = [
    {
      key: 'selected_resources',
      label: `${checkedResourceIds.length} Selected`,
      disabled: true,
    },
    ...(!isInPreviewMode || isInClusterMode
      ? [
          {
            key: 'delete',
            label: 'Delete',
            style: {color: Colors.red7},
            onClick: onClickDelete,
          },
        ]
      : []),
    ...(!isInClusterMode ? [{key: 'deploy', label: 'Deploy', onClick: onClickDeployChecked}] : []),
    ...(isInPreviewMode || areOnlyUnsavedResourcesChecked
      ? [{key: 'save_to_file_folder', label: 'Save to file/folder', onClick: onClickSaveToFileFolder}]
      : []),
    {key: 'deselect', label: <CloseOutlined />, style: {marginLeft: 'auto'}, onClick: onClickUncheckAll},
  ];

  return (
    <>
      <S.Menu mode="horizontal" items={menuItems} />

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

const deleteCheckedResourcesWithConfirm = (checkedResources: K8sResource[], dispatch: AppDispatch) => {
  let title = `Are you sure you want to delete the selected resources (${checkedResources.length}) ?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    centered: true,
    onOk() {
      let alertMessage = '';
      return new Promise(resolve => {
        const resourceIdsToRemove: string[] = [];
        checkedResources.forEach(resource => {
          resourceIdsToRemove.push(resource.id);
          alertMessage += `${alertMessage && ' | '}${resource.name}\n`;
        });
        dispatch(removeResources(resourceIdsToRemove));
        dispatch(uncheckAllResourceIds());

        dispatch(setAlert({type: AlertEnum.Success, title: 'Successfully deleted resources', message: alertMessage}));
        resolve({});
      });
    },
    onCancel() {},
  });
};

export default CheckedResourcesActionsMenu;
