import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Button, Modal, Select} from 'antd';

import {FolderAddOutlined} from '@ant-design/icons';

import fs from 'fs';
import micromatch from 'micromatch';
import path from 'path';
import util from 'util';
import {stringify} from 'yaml';

import {ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {uncheckAllResourceIds} from '@redux/reducers/main';
import {closeSaveResourcesToFileFolderModal} from '@redux/reducers/ui';

import FileExplorer from '@components/atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

import * as S from './styled';

const {Option} = Select;

const getFullFileName = (filename: string, fileIncludes: string[]) => {
  if (fileIncludes.some(fileInclude => micromatch.isMatch(filename, fileInclude))) {
    return filename;
  }

  return `${filename}.yaml`;
};

const SaveResourceToFileFolderModal: React.FC = () => {
  const isVisible = useAppSelector(state => state.ui.saveResourcesToFileFolderModal.isOpen);
  const resourcesIds = useAppSelector(state => state.ui.saveResourcesToFileFolderModal.resourcesIds);

  const dispatch = useAppDispatch();
  const fileIncludes = useAppSelector(state => state.config.fileIncludes);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const [errorMessage, setErrorMessage] = useState('');
  const [savingDestination, setSavingDestination] = useState<string>('saveToFolder');
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [selectedFolder, setSelectedFolder] = useState<string>();
  const [saveToFolderPaths, setSaveToFolderPaths] = useState<Record<'create' | 'replace', string[]>>({
    create: [],
    replace: [],
  });

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        setSelectedFolder(folderPath);
      }
    },
    {isDirectoryExplorer: true}
  );

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
        if (foldersList.includes(selectedFolder)) {
          absolutePath =
            selectedFolder === ROOT_FILE_ENTRY
              ? path.join(fileMap[ROOT_FILE_ENTRY].filePath, fullFileName)
              : path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFolder, fullFileName);
        } else {
          absolutePath = path.join(selectedFolder, fullFileName);
        }
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

    dispatch(closeSaveResourcesToFileFolderModal());
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
    if (!resourcesIds || !resourcesIds.length || !selectedFolder || savingDestination === 'saveToFile') {
      return;
    }

    const generateCreatedAndReplacedFiles = async () => {
      let filesToBeCreated: string[] = [];
      let filesToBeReplaced: string[] = [];

      if (fileMap[ROOT_FILE_ENTRY] && selectedFolder.startsWith(fileMap[ROOT_FILE_ENTRY].filePath)) {
        const currentFolder = selectedFolder.split(`${fileMap[ROOT_FILE_ENTRY].filePath}`).pop();

        if (currentFolder) {
          setSelectedFolder(currentFolder.slice(1));
        } else {
          setSelectedFolder(ROOT_FILE_ENTRY);
        }
        return;
      }

      let subfolders: fs.Dirent[] = [];

      // check if there isn't a local folder selected or if the selected folder is not found in the filemap
      if (!Object.keys(fileMap).length || !foldersList.find(folderName => folderName === selectedFolder)) {
        const fsReaddirPromise = util.promisify(fs.readdir);
        subfolders = await fsReaddirPromise(selectedFolder, {withFileTypes: true});
      }

      resourcesIds.forEach(resourceId => {
        const resource = resourceMap[resourceId];
        const fullFileName = getFullFileName(resource.name, fileIncludes);

        if (
          (subfolders.length && subfolders.find(dirent => dirent.name === fullFileName)) ||
          fileMap[`\\${path.join(selectedFolder, fullFileName)}`]
        ) {
          filesToBeReplaced.push(fullFileName);
        } else {
          filesToBeCreated.push(fullFileName);
        }
      });

      setSaveToFolderPaths({create: filesToBeCreated, replace: filesToBeReplaced});
    };

    generateCreatedAndReplacedFiles();
  }, [fileIncludes, fileMap, foldersList, savingDestination, resourcesIds, resourceMap, selectedFolder]);

  useEffect(() => {
    if (isVisible) {
      if (Object.keys(fileMap).length) {
        setSelectedFolder(ROOT_FILE_ENTRY);
        return;
      }

      setSelectedFolder(undefined);
      setSaveToFolderPaths({create: [], replace: []});
    }
  }, [fileMap, isVisible]);

  return (
    <Modal
      title={resourcesIds.length === 1 ? 'Save resource' : `Save resources (${resourcesIds.length})`}
      visible={isVisible}
      onCancel={() => dispatch(closeSaveResourcesToFileFolderModal())}
      onOk={saveCheckedResourcesToFileFolder}
    >
      <S.SaveDestinationWrapper>
        <S.Select
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
        </S.Select>

        {savingDestination === 'saveToFolder' && (
          <S.Select
            placeholder="Select folder"
            showSearch
            onChange={(value: any) => setSelectedFolder(value)}
            value={selectedFolder}
            dropdownRender={menu => (
              <>
                <Button icon={<FolderAddOutlined />} type="link" onClick={openFileExplorer}>
                  Browse
                </Button>
                <FileExplorer {...fileExplorerProps} />
                <S.Divider />

                {menu}
              </>
            )}
          >
            {renderFolderSelectOptions()}
          </S.Select>
        )}

        {savingDestination === 'saveToFile' && (
          <S.Select
            showSearch
            onChange={(value: any) => {
              setSelectedFile(value);

              if (errorMessage) {
                setErrorMessage('');
              }
            }}
            value={selectedFile}
            placeholder="Select a destination file"
          >
            {renderFileSelectOptions()}
          </S.Select>
        )}
      </S.SaveDestinationWrapper>
      {errorMessage && <S.ErrorMessageLabel>*{errorMessage}</S.ErrorMessageLabel>}

      {savingDestination === 'saveToFolder' && (
        <div style={{marginTop: '16px'}}>
          {saveToFolderPaths.create.length ? (
            <>
              <S.FileCategoryLabel>Files to be created</S.FileCategoryLabel>
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
              <S.FileCategoryLabel>Files to be replaced</S.FileCategoryLabel>
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
