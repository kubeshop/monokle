import {useCallback, useState} from 'react';
import {useStore} from 'react-redux';
import {useAsync, useInterval} from 'react-use';

import {isEqual} from 'lodash';
import {Store} from 'redux';

import {getCloudPolicy, getCloudUser, startCloudLogin} from '@redux/cloud/ipc';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {CloudUser} from '@shared/models/cloud';
import {RootState} from '@shared/models/rootState';

import {setCloudPolicy} from './validation.slice';

const pollCloudPolicy = async (store: Store<RootState>) => {
  const rootFileEntry = store.getState().main.fileMap[ROOT_FILE_ENTRY];
  const rootFolderPath = rootFileEntry?.filePath;
  const cloudPolicy = rootFolderPath ? await getCloudPolicy(rootFolderPath) : undefined;

  if (!cloudPolicy) {
    return;
  }

  const previousCloudPolicy = store.getState().validation.cloudPolicy;

  if (previousCloudPolicy && isEqual(previousCloudPolicy, cloudPolicy)) {
    return;
  }

  store.dispatch(setCloudPolicy(cloudPolicy));
};

export const useCloudPolicy = () => {
  const store = useStore<RootState>();
  const foundPolicy = store.getState().validation.cloudPolicy !== undefined;
  useInterval(() => {
    pollCloudPolicy(store);
  }, 60 * 1000);
  return {foundPolicy};
};

export const useCloudUser = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
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
    setCloudUser(user);
    setIsConnecting(false);
  }, []);

  return {
    connect,
    cloudUser,
    isInitializing,
    isConnecting,
  };
};
