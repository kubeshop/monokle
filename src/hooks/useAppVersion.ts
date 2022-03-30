import {useEffect, useState} from 'react';

import {fetchAppVersion} from '@utils/appVersion';

export const useAppVersion = (): string => {
  const [appVersion, setAppVersion] = useState<string>('');
  useEffect(() => {
    fetchAppVersion().then(version => setAppVersion(version));
  }, []);
  return appVersion;
};
