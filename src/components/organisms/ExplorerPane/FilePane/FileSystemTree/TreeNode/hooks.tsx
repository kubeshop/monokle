import {useCallback, useMemo, useState} from 'react';

import {Modal} from 'antd';
import {ItemType as AntdMenuItem} from 'antd/lib/menu/hooks/useItems';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {basename, dirname, join, sep} from 'path';

import {scanExcludesSelector, updateProjectConfig} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {
  openCreateFileFolderModal,
  openFileCompareModal,
  openNewResourceWizard,
  openRenameEntityModal,
} from '@redux/reducers/ui';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {getHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFile, isKustomizationResource} from '@redux/services/kustomize';
import {startPreview} from '@redux/services/preview';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {useFilterByFileOrFolder} from '@hooks/fileTreeHooks';

import {deleteFileEntry, dispatchDeleteAlert, duplicateEntity, isFileEntryDisabled} from '@utils/files';
import {useOpenOnGithub} from '@utils/git';
import {useRefSelector} from '@utils/hooks';

import {isYamlFile} from '@monokle/validation';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertEnum} from '@shared/models/alert';
import {FileEntry} from '@shared/models/fileEntry';
import {isDefined} from '@shared/utils/filter';
import {isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@shared/utils/helm';
import {showItemInFolder} from '@shared/utils/shell';

export const useCanPreview = (fileEntry?: FileEntry, isDisabled?: boolean) => {
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const helmValuesMapRef = useRefSelector(state => state.main.helmValuesMap);

  return useMemo((): boolean => {
    if (!fileEntry || isDisabled) {
      return false;
    }
    return (
      isKustomizationFile(fileEntry, localResourceMetaMapRef.current) ||
      getHelmValuesFile(fileEntry, helmValuesMapRef.current) !== undefined
    );
  }, [fileEntry, isDisabled, localResourceMetaMapRef, helmValuesMapRef]);
};

export const useDelete = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const deleteEntry = useCallback(
    async (fileEntry?: FileEntry) => {
      if (!fileEntry) {
        return;
      }

      let title = `Delete ${isDefined(fileEntry.children) ? 'folder' : 'file'} [${fileEntry.name}]?`;

      Modal.confirm({
        title,
        onOk() {
          return new Promise(resolve => {
            setImmediate(async () => {
              setIsLoading(true);
              const result = await deleteFileEntry(fileEntry);
              dispatchDeleteAlert(dispatch, result);
              setIsLoading(false);
            });
            resolve({});
          });
        },
        onCancel() {},
      });
    },
    [dispatch]
  );

  return {
    deleteEntry,
    isDeleteLoading: isLoading,
  };
};

export const useCreateResource = () => {
  const dispatch = useAppDispatch();

  const createResource = useCallback(
    (entry: FileEntry) => {
      if (isDefined(entry.children)) {
        dispatch(openNewResourceWizard({defaultInput: {targetFolder: entry.filePath}}));
      } else {
        dispatch(openNewResourceWizard({defaultInput: {targetFile: entry.filePath}}));
      }
    },
    [dispatch]
  );

  return createResource;
};

export const useRename = () => {
  const dispatch = useAppDispatch();

  const rename = useCallback(
    (fileEntry: FileEntry) => {
      dispatch(openRenameEntityModal({absolutePathToEntity: join(fileEntry.rootFolderPath, fileEntry.filePath)}));
    },
    [dispatch]
  );

  return rename;
};

export const useIsDisabled = (fileEntry?: FileEntry) => {
  const isDisabled = useMemo(() => {
    return isFileEntryDisabled(fileEntry);
  }, [fileEntry]);
  return isDisabled;
};

export const usePreview = () => {
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const fileMapRef = useRefSelector(state => state.main.fileMap);
  const helmValuesMapRef = useRefSelector(state => state.main.helmValuesMap);

  const dispatch = useAppDispatch();

  const preview = useCallback(
    (relativePath: string) => {
      const resourceMetas = getLocalResourceMetasForPath(relativePath, localResourceMetaMapRef.current);
      if (resourceMetas && resourceMetas.length === 1 && isKustomizationResource(resourceMetas[0])) {
        startPreview({type: 'kustomize', kustomizationId: resourceMetas[0].id}, dispatch);
      } else {
        const fileEntry = fileMapRef.current[relativePath];
        if (fileEntry) {
          const valuesFile = getHelmValuesFile(fileEntry, helmValuesMapRef.current);
          if (valuesFile) {
            startPreview({type: 'helm', valuesFileId: valuesFile.id, chartId: valuesFile.helmChartId}, dispatch);
          }
        }
      }
    },
    [dispatch, localResourceMetaMapRef, fileMapRef, helmValuesMapRef]
  );

  return preview;
};

export const useDuplicate = () => {
  const dispatch = useAppDispatch();

  const duplicate = useCallback(
    (fileEntry: FileEntry) => {
      const absolutePath = join(fileEntry.rootFolderPath, fileEntry.filePath);
      const fileName = basename(absolutePath);
      const dirName = dirname(absolutePath);

      duplicateEntity(absolutePath, fileName, dirName, args => {
        const {duplicatedFileName, err} = args;

        if (err) {
          dispatch(
            setAlert({
              title: 'Duplication failed',
              message: `Something went wrong during duplicating "${absolutePath}"`,
              type: AlertEnum.Error,
            })
          );
        } else {
          dispatch(
            setAlert({
              title: `Duplication succeded`,
              message: `You have successfully created ${duplicatedFileName}`,
              type: AlertEnum.Success,
            })
          );
        }
      });
    },
    [dispatch]
  );

  return duplicate;
};

export const useFileScanning = (onConfirm: () => void) => {
  const scanExcludes = useAppSelector(scanExcludesSelector);
  const projectConfigRef = useRefSelector(state => state.config.projectConfig);
  const dispatch = useAppDispatch();

  const openConfirmModal = useCallback(() => {
    Modal.confirm({
      title: 'You should reload the file explorer to have your changes applied. Do you want to do it now?',
      icon: <ExclamationCircleOutlined />,
      cancelText: 'Not now',
      onOk: () => {
        onConfirm();
      },
    });
  }, [onConfirm]);

  const addEntryToScanExcludes = useCallback(
    (relativePath: string) => {
      dispatch(
        updateProjectConfig({
          config: {
            ...projectConfigRef.current,
            scanExcludes: [...scanExcludes, relativePath],
          },
          fromConfigFile: false,
        })
      );
      openConfirmModal();
    },
    [dispatch, openConfirmModal, scanExcludes, projectConfigRef]
  );

  const removeEntryFromScanExcludes = useCallback(
    (relativePath: string) => {
      dispatch(
        updateProjectConfig({
          config: {
            ...projectConfigRef.current,
            scanExcludes: scanExcludes.filter(scanExclude => scanExclude !== relativePath),
          },
          fromConfigFile: false,
        })
      );
      openConfirmModal();
    },
    [dispatch, openConfirmModal, scanExcludes, projectConfigRef]
  );

  return {addEntryToScanExcludes, removeEntryFromScanExcludes};
};

export const useCommonMenuItems = (props: {deleteEntry: (e: FileEntry) => void}, fileEntry?: FileEntry) => {
  const {deleteEntry} = props;
  const dispatch = useAppDispatch();
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);

  const {canOpenOnGithub, openOnGithub} = useOpenOnGithub(
    fileEntry?.name === ROOT_FILE_ENTRY ? '' : fileEntry?.filePath
  );
  const renameFileEntry = useRename();
  const reloadRootFolder = useCallback(() => {
    if (!fileEntry) {
      return;
    }
    dispatch(setRootFolder(fileEntry.rootFolderPath));
  }, [fileEntry, dispatch]);

  const {addEntryToScanExcludes, removeEntryFromScanExcludes} = useFileScanning(reloadRootFolder);

  const menuItems = useMemo(() => {
    if (!fileEntry) {
      return [];
    }

    const isRoot = fileEntry.name === ROOT_FILE_ENTRY;
    const filePath = isRoot ? '' : fileEntry.filePath;

    const newMenuItems: AntdMenuItem[] = [];

    newMenuItems.push({
      type: 'divider',
      key: 'divider-1',
    });

    newMenuItems.push({
      disabled: isRoot,
      key: 'update_scanning',
      label: `${fileEntry.isExcluded ? 'Remove from' : 'Add to'} Files: Exclude`,
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        if (fileEntry.isExcluded) {
          removeEntryFromScanExcludes(filePath);
        } else {
          addEntryToScanExcludes(filePath);
        }
      },
    });

    newMenuItems.push({
      key: 'copy-full-path',
      label: 'Copy path',
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        navigator.clipboard.writeText(join(fileEntry.rootFolderPath, filePath));
      },
    });

    newMenuItems.push({
      key: 'copy-relative-path',
      label: 'Copy relative path',
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        navigator.clipboard.writeText(filePath);
      },
    });

    newMenuItems.push({
      key: 'rename',
      label: 'Rename',
      disabled: isRoot,
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        renameFileEntry(fileEntry);
      },
    });

    newMenuItems.push({
      key: 'delete',
      label: 'Delete',
      disabled: isRoot,
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        deleteEntry(fileEntry);
      },
    });

    newMenuItems.push({
      key: 'open-in-github',
      label: 'Open on GitHub',
      disabled: !canOpenOnGithub,
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        openOnGithub();
      },
    });

    newMenuItems.push({
      key: 'reveal',
      label: `Reveal in ${platformFileManagerName}`,
      onClick: (e: any) => {
        e.domEvent.stopPropagation();

        if (fileEntry.name === ROOT_FILE_ENTRY) {
          showItemInFolder(fileEntry.rootFolderPath);
          return;
        }

        showItemInFolder(join(fileEntry.rootFolderPath, filePath));
      },
    });

    return newMenuItems;
  }, [
    fileEntry,
    platformFileManagerName,
    addEntryToScanExcludes,
    removeEntryFromScanExcludes,
    openOnGithub,
    canOpenOnGithub,
    renameFileEntry,
    deleteEntry,
  ]);

  return menuItems;
};

export const useFileMenuItems = (
  props: {deleteEntry: (e: FileEntry) => void; canBePreviewed: boolean},
  fileEntry?: FileEntry
) => {
  const {deleteEntry, canBePreviewed} = props;
  const dispatch = useAppDispatch();
  const commonMenuItems = useCommonMenuItems({deleteEntry}, fileEntry);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const createNewResource = useCreateResource();
  const {onFilterByFileOrFolder} = useFilterByFileOrFolder();

  const preview = usePreview();
  const duplicate = useDuplicate();

  const menuItems = useMemo(() => {
    const isFolder = isDefined(fileEntry?.children);
    if (!fileEntry || isFolder) {
      return [];
    }

    const isNonResourceFile =
      isKustomizationFile(fileEntry, localResourceMetaMapRef.current) ||
      isHelmChartFile(fileEntry.filePath) ||
      isHelmValuesFile(fileEntry.filePath) ||
      isHelmTemplateFile(fileEntry.filePath) ||
      !fileEntry.isSupported ||
      fileEntry.isExcluded;

    const newMenuItems: AntdMenuItem[] = [];

    if (canBePreviewed) {
      newMenuItems.push({
        key: 'preview',
        label: 'Preview',
        onClick: () => {
          preview(fileEntry.filePath);
        },
      });
    }

    newMenuItems.push({
      key: 'new-file',
      label: 'New File',
      onClick: () => {
        dispatch(
          openCreateFileFolderModal({
            rootDir: join(fileEntry.rootFolderPath, fileEntry.filePath.split(sep).slice(0, -1).join(sep)),
            type: 'file',
          })
        );
      },
    });

    newMenuItems.push({
      key: 'new-folder',
      label: 'New Folder',
      onClick: () => {
        dispatch(
          openCreateFileFolderModal({
            rootDir: join(fileEntry.rootFolderPath, fileEntry.filePath.split(sep).slice(0, -1).join(sep)),
            type: 'folder',
          })
        );
      },
    });

    newMenuItems.push({
      key: 'add-resource',
      label: 'Add Resource',
      disabled: isNonResourceFile,
      onClick: () => {
        createNewResource(fileEntry);
      },
    });

    newMenuItems.push({
      key: 'filter_on_file',
      label:
        fileOrFolderContainedInFilter && fileEntry.filePath === fileOrFolderContainedInFilter
          ? 'Remove from filter'
          : 'Filter on this file',
      disabled: isNonResourceFile,
      onClick: () => {
        if (fileOrFolderContainedInFilter && fileEntry.filePath === fileOrFolderContainedInFilter) {
          onFilterByFileOrFolder(undefined);
        } else {
          onFilterByFileOrFolder(fileEntry.filePath);
        }
      },
    });

    newMenuItems.push({
      key: 'duplicate',
      label: 'Duplicate',
      onClick: () => {
        duplicate(fileEntry);
      },
    });

    if (isYamlFile(fileEntry.filePath)) {
      newMenuItems.push({
        key: 'compare',
        label: 'Compare with another file',
        onClick: () => {
          dispatch(openFileCompareModal(fileEntry.filePath));
        },
      });
    }

    newMenuItems.push(...commonMenuItems);

    return newMenuItems;
  }, [
    fileEntry,
    localResourceMetaMapRef,
    canBePreviewed,
    commonMenuItems,
    preview,
    dispatch,
    createNewResource,
    fileOrFolderContainedInFilter,
    onFilterByFileOrFolder,
    duplicate,
  ]);

  return menuItems;
};

export const useFolderMenuItems = (
  stateArgs: {deleteEntry: (e: FileEntry) => void; isInClusterMode: boolean; isInPreviewMode: boolean},
  fileEntry?: FileEntry
) => {
  const {deleteEntry, isInClusterMode, isInPreviewMode} = stateArgs;
  const dispatch = useAppDispatch();
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const commonMenuItems = useCommonMenuItems({deleteEntry}, fileEntry);
  const createNewResource = useCreateResource();
  const {onFilterByFileOrFolder} = useFilterByFileOrFolder();

  const menuItems = useMemo(() => {
    const isFolder = isDefined(fileEntry?.children);
    if (!fileEntry || !isFolder) {
      return [];
    }

    const isRoot = fileEntry.name === ROOT_FILE_ENTRY;
    const filePath = isRoot ? '' : fileEntry?.filePath;

    const newMenuItems: AntdMenuItem[] = [];

    newMenuItems.push({
      key: 'new-folder',
      label: 'New Folder',
      onClick: () => {
        dispatch(openCreateFileFolderModal({rootDir: join(fileEntry.rootFolderPath, filePath), type: 'folder'}));
      },
    });

    newMenuItems.push({
      key: 'new-file',
      label: 'New File',
      onClick: () => {
        dispatch(openCreateFileFolderModal({rootDir: join(fileEntry.rootFolderPath, filePath), type: 'file'}));
      },
    });

    newMenuItems.push({
      key: 'new-resource',
      label: 'New Resource',
      disabled: isInClusterMode || isInPreviewMode,
      onClick: () => {
        createNewResource(fileEntry);
      },
    });

    newMenuItems.push({
      key: 'filter_on_folder',
      label:
        fileOrFolderContainedInFilter && filePath === fileOrFolderContainedInFilter
          ? 'Remove from filter'
          : 'Filter on this folder',
      onClick: () => {
        if (fileOrFolderContainedInFilter && filePath === fileOrFolderContainedInFilter) {
          onFilterByFileOrFolder(undefined);
        } else {
          onFilterByFileOrFolder(filePath);
        }
      },
    });

    newMenuItems.push(...commonMenuItems);

    return newMenuItems;
  }, [
    fileEntry,
    isInClusterMode,
    isInPreviewMode,
    fileOrFolderContainedInFilter,
    commonMenuItems,
    dispatch,
    createNewResource,
    onFilterByFileOrFolder,
  ]);

  return menuItems;
};
