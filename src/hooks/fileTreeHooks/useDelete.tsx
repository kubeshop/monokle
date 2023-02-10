import {useState} from 'react';

import {useAppDispatch} from '@redux/hooks';

import {dispatchDeleteAlert} from '@utils/files';

import {ProcessingEntity} from '@shared/models/explorer';

export const useDelete = () => {
  const [processingEntity, setProcessingEntity] = useState<ProcessingEntity>({
    processingEntityID: undefined,
    processingType: undefined,
  });

  const dispatch = useAppDispatch();

  const onDelete = (args: {isDirectory: boolean; name: string; err: NodeJS.ErrnoException | null}): void => {
    dispatchDeleteAlert(dispatch, args);

    /**
     * Deleting is performed immediately.
     * The Ant Tree component is not updated immediately.
     * I show the loader long enough to let the Ant Tree component update.
     */
    setTimeout(() => {
      setProcessingEntity({processingEntityID: undefined, processingType: undefined});
    }, 2000);
  };

  return {onDelete, processingEntity, setProcessingEntity};
};
