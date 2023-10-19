import {useCallback, useEffect, useState} from 'react';
import {useStore} from 'react-redux';
import {useAsync, useInterval, useMount} from 'react-use';

import {isEqual} from 'lodash';

import {getCloudInfo, getCloudPolicy, getCloudUser, logoutFromCloud, startCloudLogin} from '@redux/cloud/ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {setCloudPolicyInfo, setCloudProjectInfo, setCloudUser} from '@redux/reducers/cloud';
import {rootFolderSelector} from '@redux/selectors';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
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
    if (previousCloudPolicy) {
      dispatch(setCloudPolicy(undefined));
    }
    return;
  }

  if (previousCloudPolicy && isEqual(previousCloudPolicy, cloudPolicy)) {
    return;
  }

  if (!previousCloudPolicy) {
    dispatch(
      setAlert({
        type: AlertEnum.Success,
        title: 'Repository connected to Cloud Project',
        message:
          'This repository has been connected successfully to a Cloud Project. The Policy is now being synchronized.',
        silent: true,
      })
    );
  } else {
    dispatch(
      setAlert({
        type: AlertEnum.Success,
        title: 'Cloud Policy updated',
        message: 'The Policy has been changed in the Cloud Project and is now being synchronized.',
        silent: true,
      })
    );
  }

  dispatch(setCloudPolicy(cloudPolicy));
};

export const useCloudPolicy = () => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const cloudPolicy = useAppSelector(state => state.validation.cloudPolicy);
  const rootFolderPath = useAppSelector(rootFolderSelector);

  const projectInfo = useAppSelector(state => state.cloud.projectInfo);
  const policyInfo = useAppSelector(state => state.cloud.policyInfo);

  const updateProjectInfo = useCallback(async () => {
    const cloudInfo = await getCloudInfo(rootFolderPath);
    dispatch(setCloudProjectInfo(cloudInfo?.projectInfo));
    dispatch(setCloudPolicyInfo(cloudInfo?.policyInfo));

    if (cloudPolicy && cloudInfo?.projectInfo && !cloudProjectsThisSession.has(cloudInfo.projectInfo.slug)) {
      trackEvent('cloud_sync/policy', {projectSlug: cloudInfo.projectInfo.slug});
      cloudProjectsThisSession.add(cloudInfo.projectInfo.slug);
    }
  }, [rootFolderPath, cloudPolicy, dispatch]);

  useMount(() => {
    pollCloudPolicy(store.getState(), dispatch);
    updateProjectInfo();
  });

  useEffect(() => {
    pollCloudPolicy(store.getState(), dispatch);
    updateProjectInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootFolderPath]);

  useInterval(() => {
    pollCloudPolicy(store.getState(), dispatch);
  }, 20 * 1000);

  return {cloudPolicy, projectInfo, policyInfo};
};

export const useCloudUser = () => {
  const store = useStore<RootState>();
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const cloudUser = useAppSelector(state => state.cloud.user);

  useAsync(async () => {
    setIsInitializing(true);
    const user = await getCloudUser(undefined);
    dispatch(setCloudUser(user));
    setIsInitializing(false);
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    const {user} = await startCloudLogin(undefined);
    trackEvent('cloud_sync/login');
    dispatch(setCloudUser(user));
    pollCloudPolicy(store.getState(), dispatch);
    setIsConnecting(false);
  };

  const disconnect = async () => {
    setIsDisconnecting(true);
    await logoutFromCloud(undefined);
    trackEvent('cloud_sync/logout');
    dispatch(setCloudUser(undefined));
    dispatch(setCloudPolicy(undefined));
    dispatch(setCloudProjectInfo(undefined));
    dispatch(setCloudPolicyInfo(undefined));
    setIsDisconnecting(false);
  };

  return {
    connect,
    disconnect,
    cloudUser,
    isInitializing,
    isConnecting,
    isDisconnecting,
  };
};
