import React, {useCallback, useMemo, useState} from 'react';

import {Modal} from 'antd';

import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import {makeApplyMultipleResourcesText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {editorHasReloadedSelectedPath, uncheckAllResourceIds} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {
  isInClusterModeSelector,
  isInPreviewModeSelector,
  kubeConfigContextColorSelector,
  kubeConfigContextSelector,
} from '@redux/selectors';
import {isUnsavedResource} from '@redux/services/resource';
import {applyCheckedResources} from '@redux/thunks/applyCheckedResources';
import {removeResources} from '@redux/thunks/removeResources';

import Colors from '@styles/Colors';

import {AlertEnum, AppDispatch, K8sResource} from '@monokle-desktop/shared/models';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';
import * as S from './CheckedResourcesActionMenu.styled';

const CheckedResourcesActionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

  const onClickDelete = useCallback(() => {
    const resourcesToDelete = checkedResourceIds
      .map(resource => resourceMap[resource])
      .filter((r): r is K8sResource => r !== undefined);

    deleteCheckedResourcesWithConfirm(resourcesToDelete, dispatch);
  }, [checkedResourceIds, dispatch, resourceMap]);

  const onClickUncheckAll = useCallback(() => {
    dispatch(uncheckAllResourceIds());
  }, [dispatch]);

  const onClickSaveToFileFolder = useCallback(() => {
    dispatch(openSaveResourcesToFileFolderModal(checkedResourceIds));
  }, [checkedResourceIds, dispatch]);

  const onClickDeployChecked = () => {
    setIsApplyModalVisible(true);
  };

  const onClickApplyCheckedResources = (namespace?: {name: string; new: boolean}) => {
    dispatch(applyCheckedResources(namespace));
    setIsApplyModalVisible(false);
  };

  const areOnlyUnsavedResourcesChecked = useMemo(
    () =>
      checkedResourceIds
        .map(resourceId => resourceMap[resourceId])
        .filter((resource): resource is K8sResource => resource !== undefined)
        .every(isUnsavedResource),
    [checkedResourceIds, resourceMap]
  );

  const checkedResources = useMemo(
    () => checkedResourceIds.map(resource => resourceMap[resource]).filter((r): r is K8sResource => r !== undefined),
    [checkedResourceIds, resourceMap]
  );

  const confirmModalTitle = useMemo(
    () => makeApplyMultipleResourcesText(checkedResources.length, kubeConfigContext, kubeConfigContextColor),
    [checkedResources.length, kubeConfigContext, kubeConfigContextColor]
  );

  const menuItems = useMemo(
    () => [
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
    ],
    [
      areOnlyUnsavedResourcesChecked,
      checkedResourceIds.length,
      isInClusterMode,
      isInPreviewMode,
      onClickDelete,
      onClickSaveToFileFolder,
      onClickUncheckAll,
    ]
  );

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
        dispatch(editorHasReloadedSelectedPath(true));
        dispatch(setAlert({type: AlertEnum.Success, title: 'Successfully deleted resources', message: alertMessage}));
        resolve({});
      });
    },
    onCancel() {},
  });
};

export default CheckedResourcesActionsMenu;
