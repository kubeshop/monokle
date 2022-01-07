import React, {useCallback, useMemo, useState} from 'react';

import {Input, Menu, Modal, Select} from 'antd';

import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import fs from 'fs';
import path from 'path';
import styled from 'styled-components';
import {stringify} from 'yaml';

import {ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@constants/constants';
import {makeApplyMultipleResourcesText} from '@constants/makeApplyText';

import {AlertEnum} from '@models/alert';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {removeResource, uncheckAllResourceIds} from '@redux/reducers/main';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';
import {AppDispatch} from '@redux/store';
import {applyCheckedResources} from '@redux/thunks/applyCheckedResources';

import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';

const {Option} = Select;

const ErrorMessageLabel = styled.div`
  color: ${Colors.redError};
  margin-top: 10px;
`;

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

const StyledSelect = styled(Select)`
  flex: 1;
  overflow-x: hidden;
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

const getFullFileName = (filename: string) => {
  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
    return filename;
  }

  return `${filename}.yaml`;
};

const CheckedResourcesActionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const currentContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const [errorMessage, setErrorMessage] = useState('');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isSaveToFileFolderModalVisible, setIsSaveToFileFolderModalVisible] = useState(false);
  const [savingDestination, setSavingDestination] = useState<string>('saveToFile');
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [selectedFolder, setSelectedFolder] = useState(ROOT_FILE_ENTRY);

  const checkedResources = useMemo(
    () => checkedResourceIds.map(resource => resourceMap[resource]).filter((r): r is K8sResource => r !== undefined),
    [checkedResourceIds, resourceMap]
  );

  const confirmModalTitle = useMemo(
    () => makeApplyMultipleResourcesText(checkedResources.length, currentContext),
    [checkedResources, currentContext]
  );

  const foldersList = useMemo(
    () =>
      Object.entries(fileMap)
        .map(([key, value]) => ({folderName: key.replace(path.sep, ''), isFolder: Boolean(value.children)}))
        .filter(file => file.isFolder),
    [fileMap]
  );

  const fileList = useMemo(
    () =>
      Object.entries(fileMap)
        .map(([key, value]) => ({fileName: key.replace(path.sep, ''), isFolder: Boolean(value.children)}))
        .filter(file => !file.isFolder),
    [fileMap]
  );

  const renderFileSelectOptions = useCallback(() => {
    return fileList.map(folder => (
      <Option key={folder.fileName} value={folder.fileName}>
        {folder.fileName}
      </Option>
    ));
  }, [fileList]);

  const renderFolderSelectOptions = useCallback(() => {
    return foldersList.map(folder => (
      <Option key={folder.folderName} value={folder.folderName}>
        {folder.folderName}
      </Option>
    ));
  }, [foldersList]);

  const onClickDelete = () => {
    const resourcesToDelete = checkedResourceIds
      .map(resource => resourceMap[resource])
      .filter((r): r is K8sResource => r !== undefined);

    deleteCheckedResourcesWithConfirm(resourcesToDelete, dispatch);
  };

  const onClickDeployChecked = () => {
    setIsApplyModalVisible(true);
  };

  const onClickApplyCheckedResources = (namespace?: string) => {
    dispatch(applyCheckedResources(namespace));
    setIsApplyModalVisible(false);
  };

  const onClickUncheckAll = () => {
    dispatch(uncheckAllResourceIds());
  };

  const saveCheckedResourcesToFileFolder = () => {
    if (!checkedResourceIds || !checkedResourceIds.length) {
      return;
    }

    if (savingDestination === 'saveToFile') {
      if (!selectedFile) {
        setErrorMessage('Select file');
        return;
      }
    }

    let writeAppendErrors = 0;

    checkedResourceIds.forEach(resourceId => {
      const resource = resourceMap[resourceId];

      let absolutePath;

      const fullFileName = getFullFileName(resource.name);
      if (savingDestination === 'saveToFolder' && selectedFolder) {
        absolutePath =
          selectedFolder === ROOT_FILE_ENTRY
            ? path.join(fileMap[ROOT_FILE_ENTRY].filePath, fullFileName)
            : path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFolder, fullFileName);
      } else if (savingDestination === 'saveToFile' && selectedFile) {
        absolutePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFile);
      } else {
        absolutePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, fullFileName);
      }

      const cleanResourceContent = removeIgnoredPathsFromResourceContent(resource.content);
      let resourceText = stringify(cleanResourceContent, {sortMapEntries: true});

      if (savingDestination === 'saveToFile') {
        if (resourceText.trim().endsWith(YAML_DOCUMENT_DELIMITER)) {
          resourceText = `\n${resourceText}`;
        } else {
          resourceText = `\n${YAML_DOCUMENT_DELIMITER}\n${resourceText}`;
        }

        fs.appendFileSync(absolutePath, resourceText);
      } else if (savingDestination === 'saveToFolder') {
        try {
          fs.writeFileSync(absolutePath, resourceText);
        } catch (err) {
          writeAppendErrors += 1;
          dispatch(
            setAlert({
              type: AlertEnum.Error,
              title: `Could not save ${absolutePath}.`,
              message: '',
            })
          );
        }
      }
    });

    setIsSaveToFileFolderModalVisible(false);
    dispatch(uncheckAllResourceIds());
    dispatch(
      setAlert({
        type: AlertEnum.Success,
        title: `${savingDestination === 'saveToFolder' ? 'Saved' : 'Added'} ${
          checkedResourceIds.length - writeAppendErrors
        } resources succesfully`,
        message: '',
      })
    );
  };

  return (
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

      {(isInPreviewMode || isInClusterMode) && (
        <Menu.Item key="save_to_file_folder" onClick={() => setIsSaveToFileFolderModalVisible(true)}>
          Save to file/folder
        </Menu.Item>
      )}

      <Menu.Item style={{marginLeft: 'auto'}} key="deselect" onClick={onClickUncheckAll}>
        <CloseOutlined />
      </Menu.Item>

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          resources={checkedResources}
          isVisible={isApplyModalVisible}
          title={confirmModalTitle}
          onOk={selectedNamespace => onClickApplyCheckedResources(selectedNamespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}

      {isSaveToFileFolderModalVisible && (
        <Modal
          title={`Save resources (${checkedResourceIds.length}) to file/folder`}
          visible={isSaveToFileFolderModalVisible}
          onCancel={() => setIsSaveToFileFolderModalVisible(false)}
          onOk={saveCheckedResourcesToFileFolder}
        >
          <SaveDestinationWrapper compact>
            <StyledSelect
              style={{flex: 1}}
              value={savingDestination}
              onChange={value => {
                setSavingDestination(value as string);

                if (errorMessage) {
                  setErrorMessage('');
                }
              }}
            >
              <Option value="saveToFolder">Save to folder</Option>
              <Option value="saveToFile">Add to file</Option>
            </StyledSelect>
            {savingDestination === 'saveToFolder' && (
              <Select
                showSearch
                onChange={(value: any) => setSelectedFolder(value)}
                value={selectedFolder}
                style={{flex: 2}}
              >
                {renderFolderSelectOptions()}
              </Select>
            )}
            {savingDestination === 'saveToFile' && (
              <StyledSelect
                showSearch
                onChange={(value: any) => {
                  setSelectedFile(value);

                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                value={selectedFile}
                placeholder="Select a destination file"
                style={{flex: 3}}
              >
                {renderFileSelectOptions()}
              </StyledSelect>
            )}
          </SaveDestinationWrapper>
          {errorMessage && <ErrorMessageLabel>*{errorMessage}</ErrorMessageLabel>}
        </Modal>
      )}
    </StyledMenu>
  );
};

export default CheckedResourcesActionsMenu;
