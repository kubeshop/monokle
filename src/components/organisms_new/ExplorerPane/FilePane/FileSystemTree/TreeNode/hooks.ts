import {useCallback, useMemo, useRef, useState} from 'react';

import {ItemType as AntdMenuItem} from 'antd/lib/menu/hooks/useItems';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {getHelmValuesFile, isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFile} from '@redux/services/kustomize';

import {deleteFileEntry, dispatchDeleteAlert, isFileEntryDisabled} from '@utils/files';
import {useRefSelector} from '@utils/hooks';

import {FileEntry} from '@shared/models/fileEntry';
import {isDefined} from '@shared/utils/filter';

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

export const useIsDisabled = (fileEntry?: FileEntry) => {
  const isDisabled = useMemo(() => {
    return isFileEntryDisabled(fileEntry);
  }, [fileEntry]);
  return isDisabled;
};

export const useFileMenuItems = (
  stateArgs: {canBePreviewed: boolean; isInClusterMode: boolean; isInPreviewMode: boolean},
  fileEntry?: FileEntry
) => {
  const {canBePreviewed, isInClusterMode, isInPreviewMode} = stateArgs;

  const osPlatform = useAppSelector(state => state.config.osPlatform);
  const platformFileManagerName = useMemo(() => (osPlatform === 'darwin' ? 'Finder' : 'Explorer'), [osPlatform]);
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const onClickPreviewRef = useRef(() => {});

  const menuItems = useMemo(() => {
    if (!fileEntry) {
      return [];
    }

    const isFolder = isDefined(fileEntry?.children);
    const newMenuItems: AntdMenuItem[] = [];

    if (canBePreviewed) {
      newMenuItems.push({
        key: 'preview',
        label: 'Preview',
        onClick: onClickPreviewRef.current,
      });
    }

    if (isFolder) {
      newMenuItems.push({
        key: 'new-folder',
        label: 'New Folder',
        onClick: () => {},
      });

      newMenuItems.push({
        key: 'new-resource',
        label: 'New Resource',
        disabled: isInClusterMode || isInPreviewMode,
        onClick: () => {},
      });
    } else {
      newMenuItems.push({
        key: 'new-file',
        label: 'New File',
        onClick: () => {},
      });

      newMenuItems.push({
        key: 'add-resource',
        label: 'Add Resource',
        disabled:
          isKustomizationFile(fileEntry, localResourceMetaMapRef.current) ||
          isHelmChartFile(fileEntry.filePath) ||
          isHelmValuesFile(fileEntry.filePath) ||
          isHelmTemplateFile(fileEntry.filePath) ||
          !fileEntry.isSupported ||
          !fileEntry.isExcluded,
      });

      newMenuItems.push({
        key: 'duplicate',
        label: 'Duplicate',
        onClick: () => {},
      });
    }

    newMenuItems.push({
      key: 'copy-full-path',
      label: 'Copy path',
      onClick: () => {},
    });

    newMenuItems.push({
      key: 'copy-relative-path',
      label: 'Copy relative path',
      onClick: () => {},
    });

    newMenuItems.push({
      key: 'rename',
      label: 'Rename',
      onClick: () => {},
    });

    newMenuItems.push({
      key: 'open-in-github',
      label: 'Open on GitHub',
      onClick: () => {},
    });

    newMenuItems.push({
      key: 'reveal',
      label: `Reveal in ${platformFileManagerName}`,
    });
  }, [fileEntry, canBePreviewed, isInClusterMode, isInPreviewMode, platformFileManagerName, localResourceMetaMapRef]);

  return menuItems;
};
