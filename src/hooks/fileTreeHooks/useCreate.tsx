import {useCallback} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';

export const useCreate = () => {
  const dispatch = useAppDispatch();

  const onCreateResource = useCallback(
    ({targetFolder, targetFile}: {targetFolder?: string; targetFile?: string}) => {
      if (targetFolder) {
        dispatch(openNewResourceWizard({defaultInput: {targetFolder}}));
      }
      if (targetFile) {
        dispatch(openNewResourceWizard({defaultInput: {targetFile}}));
      }
    },
    [dispatch]
  );

  return {onCreateResource};
};
