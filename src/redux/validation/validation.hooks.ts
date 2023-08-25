import {useCallback, useEffect, useState} from 'react';
import {useStore} from 'react-redux';
import {useAsync, useInterval, useMount} from 'react-use';

import {isEqual} from 'lodash';

import {getCloudPolicy, getCloudProjectInfo, getCloudUser, logoutFromCloud, startCloudLogin} from '@redux/cloud/ipc';
import {useAppSelector} from '@redux/hooks';
import {rootFolderSelector} from '@redux/selectors';

import {ProjectInfo} from '@monokle/synchronizer';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppDispatch} from '@shared/models/appDispatch';
import {CloudUser} from '@shared/models/cloud';
import {RootState} from '@shared/models/rootState';
import {trackEvent} from '@shared/utils';

import {setCloudPolicy} from './validation.slice';

/**
 * Used as a telemetry cache to avoid sending multiple events for the same project
 */
const cloudProjectsThisSession = new Set<string>();

export const pollCloudPolicy = async (state: RootState, dispatch: AppDispatch) => {
  const rootFileEntry = state.main.fileMap[ROOT_FILE_ENTRY];
  const rootFolderPath = rootFileEntry?.filePath;
  const cloudPolicy = rootFolderPath ? await getCloudPolicy(rootFolderPath) : undefined;
  const previousCloudPolicy = state.validation.cloudPolicy;

  if (!cloudPolicy) {
    return;
  }

  if (previousCloudPolicy && isEqual(previousCloudPolicy, cloudPolicy)) {
    return;
  }

  dispatch(setCloudPolicy(cloudPolicy));
};

export const useCloudPolicy = () => {
  const store = useStore<RootState>();
  const cloudPolicy = useAppSelector(state => state.validation.cloudPolicy);
  const rootFolderPath = useAppSelector(rootFolderSelector);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>();

  const updateProjectInfo = useCallback(async () => {
    const info = await getCloudProjectInfo(rootFolderPath);
    setProjectInfo(info);

    if (cloudPolicy && info && !cloudProjectsThisSession.has(info.slug)) {
      trackEvent('cloud_sync/policy', {projectSlug: info.slug});
      cloudProjectsThisSession.add(info.slug);
    }
  }, [rootFolderPath, cloudPolicy]);

  useMount(() => {
    pollCloudPolicy(store.getState(), store.dispatch);
    updateProjectInfo();
  });

  useEffect(() => {
    pollCloudPolicy(store.getState(), store.dispatch);
    updateProjectInfo();
  }, [store, rootFolderPath, updateProjectInfo]);

  useInterval(() => {
    pollCloudPolicy(store.getState(), store.dispatch);
    updateProjectInfo();
  }, 10 * 1000);

  return {cloudPolicy, projectInfo};
};

export const useCloudUser = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [cloudUser, setCloudUser] = useState<CloudUser>();

  useAsync(async () => {
    setIsInitializing(true);
    const user = await getCloudUser(undefined);
    setCloudUser(user);
    setIsInitializing(false);
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    const {user} = await startCloudLogin(undefined);
    trackEvent('cloud_sync/login');
    setCloudUser(user);
    setIsConnecting(false);
  }, []);

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true);
    await logoutFromCloud(undefined);
    trackEvent('cloud_sync/logout');
    setCloudUser(undefined);
    setIsDisconnecting(false);
  }, []);

  return {
    connect,
    disconnect,
    cloudUser,
    isInitializing,
    isConnecting,
    isDisconnecting,
  };
};