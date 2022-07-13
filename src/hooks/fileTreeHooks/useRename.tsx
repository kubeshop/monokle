import {useAppDispatch} from '@redux/hooks';
import {openRenameEntityModal} from '@redux/reducers/ui';

export const useRename = () => {
  const dispatch = useAppDispatch();

  const onRename = (absolutePathToEntity: string, osPlatform: string) => {
    dispatch(openRenameEntityModal({absolutePathToEntity, osPlatform}));
  };

  return {onRename};
};
