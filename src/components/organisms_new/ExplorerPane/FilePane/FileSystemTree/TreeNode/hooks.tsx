import {useCallback, useMemo, useState} from 'react';

import {Modal} from 'antd';
import {ItemType as AntdMenuItem} from 'antd/lib/menu/hooks/useItems';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {join} from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectConfig} from '@redux/reducers/appConfig';
import {openNewResourceWizard, openRenameEntityModal} from '@redux/reducers/ui';
import {scanExcludesSelector} from '@redux/selectors';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {getHelmValuesFile, isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFile, isKustomizationResource} from '@redux/services/kustomize';
import {startPreview} from '@redux/services/preview';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {deleteFileEntry, dispatchDeleteAlert, isFileEntryDisabled} from '@utils/files';
import {useOpenOnGithub} from '@utils/git';
import {useRefSelector} from '@utils/hooks';

import {FileEntry} from '@shared/models/fileEntry';
import {isDefined} from '@shared/utils/filter';
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

export const useDelete = (fileEntry?: FileEntry) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const deleteEntry = useCallback(async () => {
    if (!fileEntry) {
      return;
    }
    setIsLoading(true);
    const result = await deleteFileEntry(fileEntry);
    dispatchDeleteAlert(dispatch, result);
    setIsLoading(false);
  }, [fileEntry, dispatch]);

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

export const useCommonMenuItems = (fileEntry?: FileEntry) => {
  const dispatch = useAppDispatch();
  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);

  const {canOpenOnGithub, openOnGithub} = useOpenOnGithub(fileEntry?.filePath);
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
    const newMenuItems: AntdMenuItem[] = [];

    newMenuItems.push({
      key: 'update_scanning',
      label: `${fileEntry.isExcluded ? 'Remove from' : 'Add to'} Files: Exclude`,
      onClick: () => {
        if (fileEntry.isExcluded) {
          removeEntryFromScanExcludes(fileEntry.filePath);
        } else {
          addEntryToScanExcludes(fileEntry.filePath);
        }
      },
    });

    newMenuItems.push({
      key: 'copy-full-path',
      label: 'Copy path',
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        navigator.clipboard.writeText(join(fileEntry.rootFolderPath, fileEntry.filePath));
      },
    });

    newMenuItems.push({
      key: 'copy-relative-path',
      label: 'Copy relative path',
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        navigator.clipboard.writeText(fileEntry.filePath);
      },
    });

    newMenuItems.push({
      key: 'rename',
      label: 'Rename',
      onClick: () => {
        renameFileEntry(fileEntry);
      },
    });

    newMenuItems.push({
      key: 'open-in-github',
      label: 'Open on GitHub',
      disabled: !canOpenOnGithub,
      onClick: openOnGithub,
    });

    newMenuItems.push({
      key: 'reveal',
      label: `Reveal in ${platformFileManagerName}`,
      onClick: (e: any) => {
        e.domEvent.stopPropagation();
        showItemInFolder(join(fileEntry.rootFolderPath, fileEntry.filePath));
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
  ]);

  return menuItems;
};

export const useFileMenuItems = (stateArgs: {canBePreviewed: boolean}, fileEntry?: FileEntry) => {
  const {canBePreviewed} = stateArgs;

  const commonMenuItems = useCommonMenuItems(fileEntry);
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const createNewResource = useCreateResource();

  const preview = usePreview();

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
      !fileEntry.isExcluded;

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
      onClick: () => {},
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
      label: 'Filter on this file',
      disabled: isNonResourceFile,
    });

    newMenuItems.push({
      key: 'duplicate',
      label: 'Duplicate',
      onClick: () => {},
    });

    newMenuItems.push(...commonMenuItems);

    return newMenuItems;
  }, [fileEntry, canBePreviewed, commonMenuItems, createNewResource, preview, localResourceMetaMapRef]);

  return menuItems;
};

export const useFolderMenuItems = (
  stateArgs: {isInClusterMode: boolean; isInPreviewMode: boolean},
  fileEntry?: FileEntry
) => {
  const {isInClusterMode, isInPreviewMode} = stateArgs;

  const commonMenuItems = useCommonMenuItems(fileEntry);

  const createNewResource = useCreateResource();

  const menuItems = useMemo(() => {
    const isFolder = isDefined(fileEntry?.children);
    if (!fileEntry || !isFolder) {
      return [];
    }

    const newMenuItems: AntdMenuItem[] = [];

    newMenuItems.push({
      key: 'new-folder',
      label: 'New Folder',
      onClick: () => {},
    });

    newMenuItems.push({
      key: 'new-resource',
      label: 'New Resource',
      disabled: isInClusterMode || isInPreviewMode,
      onClick: () => {
        createNewResource(fileEntry);
      },
    });

    newMenuItems.push(...commonMenuItems);

    return newMenuItems;
  }, [fileEntry, commonMenuItems, isInClusterMode, isInPreviewMode, createNewResource]);

  return menuItems;
};