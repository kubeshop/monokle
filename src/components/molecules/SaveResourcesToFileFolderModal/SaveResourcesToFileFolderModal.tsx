import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Input, Modal, Select} from 'antd';

import fs from 'fs';
import micromatch from 'micromatch';
import path from 'path';
import styled from 'styled-components';
import {stringify} from 'yaml';

import {ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {uncheckAllResourceIds} from '@redux/reducers/main';

import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

const {Option} = Select;

const ErrorMessageLabel = styled.div`
  color: ${Colors.redError};
  margin-top: 10px;
`;

const FileCategoryLabel = styled.div`
  color: ${Colors.grey7};
  margin-bottom: 6px;
  margin-top: 16px;
`;

const SaveDestinationWrapper = styled(Input.Group)`
  display: flex !important;
`;

const StyledSelect = styled(Select)`
  flex: 1;
  overflow-x: hidden;
`;

interface IProps {
  isVisible: boolean;
  resourcesIds: string[];
  title: string;
  onCancel: () => void;
}

const getFullFileName = (filename: string, fileIncludes: string[]) => {
  if (fileIncludes.some(fileInclude => micromatch.isMatch(filename, fileInclude))) {
    return filename;
  }

  return `${filename}.yaml`;
};

const SaveResourceToFileFolderModal: React.FC<IProps> = props => {
  const {isVisible, resourcesIds, title, onCancel} = props;

  const dispatch = useAppDispatch();
  const fileIncludes = useAppSelector(state => state.config.fileIncludes);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const [errorMessage, setErrorMessage] = useState('');
  const [savingDestination, setSavingDestination] = useState<string>('saveToFolder');
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [selectedFolder, setSelectedFolder] = useState(ROOT_FILE_ENTRY);
  const [saveToFolderPaths, setSaveToFolderPaths] = useState<Record<'create' | 'replace', string[]>>({
    create: [],
    replace: [],
  });

  const [foldersList, filesList] = useMemo(() => {
    const folders: string[] = [];
    const files: string[] = [];

    Object.entries(fileMap).forEach(([key, value]) => {
      if (value.children) {
        folders.push(key.replace(path.sep, ''));
      } else {
        files.push(key.replace(path.sep, ''));
      }
    });

    return [folders, files];
  }, [fileMap]);

  const renderFileSelectOptions = useCallback(() => {
    return filesList.map(fileName => (
      <Option key={fileName} value={fileName}>
        {fileName}
      </Option>
    ));
  }, [filesList]);

  const renderFolderSelectOptions = useCallback(() => {
    return foldersList.map(folderName => (
      <Option key={folderName} value={folderName}>
        {folderName}
      </Option>
    ));
  }, [foldersList]);

  const saveCheckedResourcesToFileFolder = () => {
    if (!resourcesIds || !resourcesIds.length) {
      return;
    }

    if (savingDestination === 'saveToFile') {
      if (!selectedFile) {
        setErrorMessage('Select file');
        return;
      }
    }

    let writeAppendErrors = 0;

    resourcesIds.forEach(resourceId => {
      const resource = resourceMap[resourceId];

      let absolutePath;

      const fullFileName = getFullFileName(resource.name, fileIncludes);
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

    onCancel();
    dispatch(uncheckAllResourceIds());
    dispatch(
      setAlert({
        type: AlertEnum.Success,
        title: `${savingDestination === 'saveToFolder' ? 'Saved' : 'Added'} ${
          resourcesIds.length - writeAppendErrors
        } resources succesfully`,
        message: '',
      })
    );
  };

  useEffect(() => {
    if (!resourcesIds || !resourcesIds.length || savingDestination === 'saveToFile') {
      return;
    }

    let filesToBeCreated: string[] = [];
    let filesToBeReplaced: string[] = [];

    resourcesIds.forEach(resourceId => {
      const resource = resourceMap[resourceId];
      const fullFileName = getFullFileName(resource.name, fileIncludes);

      if (fileMap[`\\${path.join(selectedFolder, fullFileName)}`]) {
        filesToBeReplaced.push(fullFileName);
      } else {
        filesToBeCreated.push(fullFileName);
      }
    });

    setSaveToFolderPaths({create: filesToBeCreated, replace: filesToBeReplaced});
  }, [fileIncludes, fileMap, savingDestination, resourcesIds, resourceMap, selectedFolder]);

  return (
    <Modal title={title} visible={isVisible} onCancel={onCancel} onOk={saveCheckedResourcesToFileFolder}>
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
          <Option value="saveToFile">Append to file</Option>
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
            style={{flex: 2}}
          >
            {renderFileSelectOptions()}
          </StyledSelect>
        )}
      </SaveDestinationWrapper>
      {errorMessage && <ErrorMessageLabel>*{errorMessage}</ErrorMessageLabel>}

      {savingDestination === 'saveToFolder' && (
        <div style={{marginTop: '16px'}}>
          {saveToFolderPaths.create.length ? (
            <>
              <FileCategoryLabel>Files to be created</FileCategoryLabel>
              {saveToFolderPaths.create.map((p, i) => {
                const key = `${p}-${i}`;

                return (
                  <div key={key} style={{color: Colors.greenOkay}}>
                    - {p}
                  </div>
                );
              })}
            </>
          ) : null}
          {saveToFolderPaths.replace.length ? (
            <>
              <FileCategoryLabel>Files to be replaced</FileCategoryLabel>
              {saveToFolderPaths.replace.map((p, i) => {
                const key = `${p}-${i}`;

                return (
                  <div key={key} style={{color: Colors.yellow7}}>
                    - {p}
                  </div>
                );
              })}
            </>
          ) : null}
        </div>
      )}
    </Modal>
  );
};

export default SaveResourceToFileFolderModal;
