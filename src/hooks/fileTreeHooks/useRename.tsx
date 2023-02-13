import {useCallback} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {openRenameEntityModal} from '@redux/reducers/ui';

export const useRename = () => {
  const dispatch = useAppDispatch();

  const onRename = useCallback(
    (absolutePathToEntity: string) => {
      dispatch(openRenameEntityModal({absolutePathToEntity}));
    },
    [dispatch]
  );

  return {onRename};
};
