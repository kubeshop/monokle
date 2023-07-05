import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Button, Modal, Select} from 'antd';

import {FolderAddOutlined} from '@ant-design/icons';

import fs from 'fs';
import {isEmpty} from 'lodash';
import micromatch from 'micromatch';
import path from 'path';
import util from 'util';

import {YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {uncheckAllResourceIds} from '@redux/reducers/main';
import {closeSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {joinK8sResource} from '@redux/services/resource';
import {saveTransientResources} from '@redux/thunks/saveTransientResources';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {useRefSelector} from '@utils/hooks';
import {removeIgnoredPathsFromResourceObject} from '@utils/resources';
import {stringifyK8sResource} from '@utils/yaml';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertEnum} from '@shared/models/alert';
import {FileMapType} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {K8sResource} from '@shared/models/k8sResource';
import {Colors} from '@shared/styles/colors';
import {isDefined} from '@shared/utils/filter';

import * as S from './SaveResourcesToFileFolderModal.styled';

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
  const name = resource.name;
  const nameKind = includeKind ? `-${resource.kind.toLowerCase()}` : '';
  const nameSuffix = suffix ? ` (${suffix})` : '';
  const fullFileName = getFullFileName(`${name}${nameKind}${nameSuffix}`, fileIncludes);
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

const SaveResourcesToFileFolderModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileIncludes = useAppSelector(state => state.config.fileIncludes);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isVisible = useAppSelector(state => state.ui.saveResourcesToFileFolderModal.isOpen);
  const resourcesIdentifiers = useAppSelector(state => state.ui.saveResourcesToFileFolderModal.resourcesIdentifiers);

  const resourceMetaMapByStorageRef = useRefSelector(state => state.main.resourceMetaMapByStorage);
  const resourceContentMapByStorageRef = useRefSelector(state => state.main.resourceContentMapByStorage);

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
        if (!value.containsK8sResources || value.isExcluded) {
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
    if (!resourcesIdentifiers || !resourcesIdentifiers.length) {
      return;
    }

    if (savingDestination === 'appendToFile') {
      if (!selectedFile) {
        setErrorMessage('Select file');
        return;
      }
    }

    let writeAppendErrors = 0;
    let transientResources: {resource: K8sResource; absolutePath: string}[] = [];

    for (let i = 0; i < resourcesIdentifiers.length; i += 1) {
      const resourceIdentifier = resourcesIdentifiers[i];
      const resource = joinK8sResource(
        resourceMetaMapByStorageRef.current[resourceIdentifier.storage][resourceIdentifier.id],
        resourceContentMapByStorageRef.current[resourceIdentifier.storage][resourceIdentifier.id]
      );
      if (!resource) {
        // eslint-disable-next-line no-continue
        continue;
      }

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

      if (resource.storage === 'transient') {
        transientResources.push({resource, absolutePath});
      } else {
        // TODO: this should probably become a thunk that can get the resource content from the store
        // because it would be nicer to not require us to have the entire resourceContentMapByStorage in this component
        const cleanResourceContent = removeIgnoredPathsFromResourceObject(resource.object);
        let resourceText = stringifyK8sResource(cleanResourceContent, {sortMapEntries: true});

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

    if (transientResources.length) {
      dispatch(saveTransientResources({resourcePayloads: transientResources, saveMode: savingDestination}));
    }

    dispatch(closeSaveResourcesToFileFolderModal());
    dispatch(uncheckAllResourceIds());
    dispatch(
      setAlert({
        type: AlertEnum.Success,
        title: `${savingDestination === 'saveToFolder' ? 'Saved' : 'Added'} ${
          resourcesIdentifiers.length - writeAppendErrors
        } resources successfully`,
        message: '',
      })
    );
  };

  useEffect(() => {
    if (isEmpty(resourcesIdentifiers) || !selectedFolder || savingDestination === 'appendToFile') {
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
      const resources = resourcesIdentifiers
        .map(identifier =>
          joinK8sResource(
            resourceMetaMapByStorageRef.current[identifier.storage][identifier.id],
            resourceContentMapByStorageRef.current[identifier.storage][identifier.id]
          )
        )
        .filter(isDefined);
      const hasNameClash = resources.some(resource =>
        resources.filter(r => r.id !== resource.id).some(r => r.name === resource.name)
      );

      resourcesIdentifiers.forEach(resourceIdentifier => {
        const resource = joinK8sResource(
          resourceMetaMapByStorageRef.current[resourceIdentifier.storage][resourceIdentifier.id],
          resourceContentMapByStorageRef.current[resourceIdentifier.storage][resourceIdentifier.id]
        );
        if (!resource) {
          return;
        }
        let fullFileName = generateFullFileName(
          subfiles,
          resource,
          fileIncludes,
          selectedFolder,
          fileMap,
          0,
          existingFileNames,
          hasNameClash
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
  }, [
    fileIncludes,
    fileMap,
    foldersList,
    savingDestination,
    resourcesIdentifiers,
    resourceMetaMapByStorageRef,
    resourceContentMapByStorageRef,
    selectedFolder,
  ]);

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
      className="save-resource"
      title={resourcesIdentifiers.length === 1 ? 'Save resource' : `Save resources (${resourcesIdentifiers.length})`}
      open={isVisible}
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

export default SaveResourcesToFileFolderModal;
