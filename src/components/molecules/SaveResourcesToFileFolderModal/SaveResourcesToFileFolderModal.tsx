import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Button, Modal, Select} from 'antd';

import {FolderAddOutlined} from '@ant-design/icons';

import fs from 'fs';
import micromatch from 'micromatch';
import path from 'path';
import util from 'util';
import {stringify} from 'yaml';

import {ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {AlertEnum} from '@models/alert';
import {FileMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {uncheckAllResourceIds} from '@redux/reducers/main';
import {closeSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {isUnsavedResource} from '@redux/services/resource';
import {saveUnsavedResources} from '@redux/thunks/saveUnsavedResources';

import FileExplorer from '@components/atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

import * as S from './styled';

const {Option} = Select;

const getFullFileName = (filename: string, fileIncludes: string[], suffix?: string) => {
  if (micromatch.isMatch(filename, fileIncludes)) {
    return filename;
  }

  return `${filename}${suffix || ''}.yaml`;
};

const generateFullFileName = (
  subfiles: fs.Dirent[],
  resource: K8sResource,
  fileIncludes: string[],
  selectedFolder: string,
  fileMap: FileMapType,
  suffix: number,
  existingFileNames: string[],
  includeKind?: boolean
): string => {
  const {kind, name} = resource;
  let fullFileName = getFullFileName(
    `${name}${includeKind ? `-${kind}` : ''}${suffix ? ` (${suffix})` : ''}`,
    fileIncludes
  );
  let foundFile: fs.Dirent | FileEntry | undefined;
  let foundExistingFileName = false;

  if (existingFileNames.includes(fullFileName)) {
    foundExistingFileName = true;
  }

  if (!foundExistingFileName) {
    if (subfiles.length) {
      foundFile = subfiles.find(dirent => dirent.name === fullFileName);
    } else if (selectedFolder === ROOT_FILE_ENTRY) {
      foundFile = fileMap[`${path.sep}${fullFileName}`];
    } else {
      foundFile = fileMap[`${path.sep}${path.join(selectedFolder, fullFileName)}`];
    }
  }

  if (foundFile || foundExistingFileName) {
    if (includeKind) {
      return generateFullFileName(
        subfiles,
        resource,
        fileIncludes,
        selectedFolder,
        fileMap,
        suffix ? suffix + 1 : 2,
        existingFileNames,
        true
      );
    }
    return generateFullFileName(
      subfiles,
      resource,
      fileIncludes,
      selectedFolder,
      fileMap,
      suffix ? suffix + 1 : 0,
      existingFileNames,
      true
    );
  }

  return fullFileName;
};

const SaveResourceToFileFolderModal: React.FC = () => {
  const isVisible = useAppSelector(state => state.ui.saveResourcesToFileFolderModal.isOpen);
  const resourcesIds = useAppSelector(state => state.ui.saveResourcesToFileFolderModal.resourcesIds);

  const dispatch = useAppDispatch();
  const fileIncludes = useAppSelector(state => state.config.fileIncludes);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const [errorMessage, setErrorMessage] = useState('');
  const [savingDestination, setSavingDestination] = useState<'saveToFolder' | 'appendToFile'>('saveToFolder');
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [selectedFolder, setSelectedFolder] = useState<string>();
  const [saveToFolderPaths, setSaveToFolderPaths] = useState<Record<'create' | 'replace', string[]>>({
    create: [],
    replace: [],
  });

  const resourcesFileName = useRef<{[id: string]: string}>({});

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        setSelectedFolder(folderPath);
      }
    },
    {isDirectoryExplorer: true}
  );

  const [foldersList, filesList]: [string[], string[]] = useMemo(() => {
    const folders: string[] = [];
    const files: string[] = [];

    Object.entries(fileMap).forEach(([key, value]) => {
      if (value.children) {
        folders.push(key.replace(path.sep, ''));
      } else {
        if (!value.isSupported || value.isExcluded) {
          return;
        }
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

    if (savingDestination === 'appendToFile') {
      if (!selectedFile) {
        setErrorMessage('Select file');
        return;
      }
    }

    let writeAppendErrors = 0;
    let unsavedResources: {resource: K8sResource; absolutePath: string}[] = [];

    for (let i = 0; i < resourcesIds.length; i += 1) {
      const resource = resourceMap[resourcesIds[i]];

      let absolutePath;

      const fullFileName = resourcesFileName.current[resource.id];
      if (savingDestination === 'saveToFolder' && selectedFolder) {
        if (foldersList.includes(selectedFolder)) {
          absolutePath =
            selectedFolder === ROOT_FILE_ENTRY
              ? path.join(fileMap[ROOT_FILE_ENTRY].filePath, fullFileName)
              : path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFolder, fullFileName);
        } else {
          absolutePath = path.join(selectedFolder, fullFileName);
        }
      } else if (savingDestination === 'appendToFile' && selectedFile) {
        absolutePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, selectedFile);
      } else {
        absolutePath = path.join(fileMap[ROOT_FILE_ENTRY].filePath, fullFileName);
      }

      if (isUnsavedResource(resource)) {
        unsavedResources.push({resource, absolutePath});
      } else {
        const cleanResourceContent = removeIgnoredPathsFromResourceContent(resource.content);
        let resourceText = stringify(cleanResourceContent, {sortMapEntries: true});

        if (savingDestination === 'appendToFile') {
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
      }
    }

    if (unsavedResources.length) {
      dispatch(saveUnsavedResources({resourcePayloads: unsavedResources, saveMode: savingDestination}));
    }

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
    if (!resourcesIds || !resourcesIds.length || !selectedFolder || savingDestination === 'appendToFile') {
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

      let subfiles: fs.Dirent[] = [];

      // check if there isn't a local folder selected or if the selected folder is not found in the filemap
      if (!Object.keys(fileMap).length || !foldersList.find(folderName => folderName === selectedFolder)) {
        const fsReaddirPromise = util.promisify(fs.readdir);
        subfiles = (await fsReaddirPromise(selectedFolder, {withFileTypes: true})).filter(
          dirent => !dirent.isDirectory()
        );
      }

      let existingFileNames: string[] = [];

      resourcesIds.forEach(resourceId => {
        const resource = resourceMap[resourceId];
        let fullFileName = generateFullFileName(
          subfiles,
          resource,
          fileIncludes,
          selectedFolder,
          fileMap,
          0,
          existingFileNames
        );

        if (!existingFileNames.includes(fullFileName)) {
          existingFileNames.push(fullFileName);
        }

        resourcesFileName.current[resource.id] = fullFileName;
        filesToBeCreated.push(fullFileName);
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
            setSavingDestination(value as 'saveToFolder' | 'appendToFile');

            if (errorMessage) {
              setErrorMessage('');
            }
          }}
        >
          <Option value="saveToFolder">Save to folder</Option>
          <Option value="appendToFile">Append to file</Option>
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

        {savingDestination === 'appendToFile' && (
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
        </div>
      )}
    </Modal>
  );
};

export default SaveResourceToFileFolderModal;
