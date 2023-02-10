import React, {useCallback, useMemo, useState} from 'react';

import {Modal} from 'antd';

import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import {makeApplyMultipleResourcesText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {editorHasReloadedSelectedPath, uncheckAllResourceIds} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelectorNew, kubeConfigContextColorSelector} from '@redux/selectors';
import {useActiveResourceMetaMap, useResourceMap} from '@redux/selectors/resourceMapSelectors';
import {applyCheckedResources} from '@redux/thunks/applyCheckedResources';
import {removeResources} from '@redux/thunks/removeResources';

import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceIdentifier, ResourceMeta} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';
import * as S from './CheckedResourcesActionMenu.styled';

const CheckedResourcesActionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const resourceMetaMap = useActiveResourceMetaMap();
  const transientResourceMetaMap = useResourceMap('transient');
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

  const onClickDelete = useCallback(() => {
    const resourcesToDelete = checkedResourceIdentifiers
      .map(identifier => resourceMetaMap[identifier.id])
      .filter(isDefined);

    deleteCheckedResourcesWithConfirm(resourcesToDelete, dispatch);
  }, [checkedResourceIdentifiers, dispatch, resourceMetaMap]);

  const onClickUncheckAll = useCallback(() => {
    dispatch(uncheckAllResourceIds());
  }, [dispatch]);

  const onClickSaveToFileFolder = useCallback(() => {
    dispatch(openSaveResourcesToFileFolderModal(checkedResourceIdentifiers));
  }, [checkedResourceIdentifiers, dispatch]);

  const onClickDeployChecked = () => {
    setIsApplyModalVisible(true);
  };

  const onClickApplyCheckedResources = (namespace?: {name: string; new: boolean}) => {
    dispatch(applyCheckedResources(namespace));
    setIsApplyModalVisible(false);
  };

  const areOnlyTransientResourcesChecked = useMemo(
    () =>
      checkedResourceIdentifiers.map(identifier => transientResourceMetaMap[identifier.id]).filter(isDefined).length ===
      checkedResourceIdentifiers.length,
    [checkedResourceIdentifiers, transientResourceMetaMap]
  );

  const checkedResources = useMemo(
    () => checkedResourceIdentifiers.map(identifier => resourceMetaMap[identifier.id]).filter(isDefined),
    [checkedResourceIdentifiers, resourceMetaMap]
  );

  const confirmModalTitle = useMemo(
    () => makeApplyMultipleResourcesText(checkedResources.length, kubeConfigContext, kubeConfigContextColor),
    [checkedResources.length, kubeConfigContext, kubeConfigContextColor]
  );

  const menuItems = useMemo(
    () => [
      {
        key: 'selected_resources',
        label: `${checkedResourceIdentifiers.length} Selected`,
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
      ...(isInPreviewMode || areOnlyTransientResourcesChecked
        ? [{key: 'save_to_file_folder', label: 'Save to file/folder', onClick: onClickSaveToFileFolder}]
        : []),
      {key: 'deselect', label: <CloseOutlined />, style: {marginLeft: 'auto'}, onClick: onClickUncheckAll},
    ],
    [
      areOnlyTransientResourcesChecked,
      checkedResourceIdentifiers.length,
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
          resourceMetaList={checkedResources}
          isVisible={isApplyModalVisible}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyCheckedResources(namespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

const deleteCheckedResourcesWithConfirm = (checkedResources: ResourceMeta[], dispatch: AppDispatch) => {
  let title = `Are you sure you want to delete the selected resources (${checkedResources.length}) ?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    centered: true,
    onOk() {
      let alertMessage = '';
      return new Promise(resolve => {
        const resourceIdsToRemove: ResourceIdentifier[] = [];
        checkedResources.forEach(resource => {
          resourceIdsToRemove.push(resource);
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
