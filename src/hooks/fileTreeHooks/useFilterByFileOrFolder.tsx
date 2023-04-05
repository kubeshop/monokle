import {useCallback} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';

import {useRefSelector} from '@utils/hooks';

export const useFilterByFileOrFolder = () => {
  const dispatch = useAppDispatch();
  const resourceFilterRef = useRefSelector(state => state.main.resourceFilter);

  const onFilterByFileOrFolder = useCallback(
    (relativePath: string | undefined) => {
      dispatch(updateResourceFilter({...resourceFilterRef.current, fileOrFolderContainedIn: relativePath}));
    },
    [resourceFilterRef, dispatch]
  );

  return {onFilterByFileOrFolder};
};
