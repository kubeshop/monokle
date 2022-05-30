import {useState} from 'react';

import {AlertEnum} from '@models/alert';

import {useAppDispatch} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {ProcessingEntity} from '@components/organisms/FileTreePane/types';

export const useDelete = () => {
  const [processingEntity, setProcessingEntity] = useState<ProcessingEntity>({
    processingEntityID: undefined,
    processingType: undefined,
  });

  const dispatch = useAppDispatch();

  const onDelete = (args: {isDirectory: boolean; name: string; err: NodeJS.ErrnoException | null}): void => {
    const {isDirectory, name, err} = args;

    if (err) {
      dispatch(
        setAlert({
          title: 'Deleting failed',
          message: `Something went wrong during deleting a ${isDirectory ? 'directory' : 'file'}`,
          type: AlertEnum.Error,
        })
      );
    } else {
      dispatch(
        setAlert({
          title: `Successfully deleted a ${isDirectory ? 'directory' : 'file'}`,
          message: `You have successfully deleted ${name} ${isDirectory ? 'directory' : 'file'}`,
          type: AlertEnum.Success,
        })
      );
    }

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
