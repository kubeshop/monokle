import {useCallback} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {openRenameEntityModal} from '@redux/reducers/ui';

export const useRename = () => {
  const dispatch = useAppDispatch();

  const onRename = useCallback(
    (absolutePathToEntity: string, osPlatform: string) => {
      dispatch(openRenameEntityModal({absolutePathToEntity, osPlatform}));
    },
    [dispatch]
  );

  return {onRename};
};
