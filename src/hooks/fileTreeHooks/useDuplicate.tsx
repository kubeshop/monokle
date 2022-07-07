import {AlertEnum} from '@models/alert';
import {useAppDispatch} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import { duplicateEntity } from '@utils/files';

export const useDuplicate = () => {
  const dispatch = useAppDispatch();
  const onDuplicate = (absolutePathToEntity: string, entityName: string, dirName: string) => {
    duplicateEntity(absolutePathToEntity, entityName, dirName, args => {
      const {duplicatedFileName, err} = args;

      if (err) {
        dispatch(
          setAlert({
            title: 'Duplication failed',
            message: `Something went wrong during duplicating "${absolutePathToEntity}"`,
            type: AlertEnum.Error,
          })
        );
      } else {
        dispatch(
          setAlert({
            title: `Duplication succeded`,
            message: `You have successfully created ${duplicatedFileName}`,
            type: AlertEnum.Success,
          })
        );
      }
    });
  };

  return {onDuplicate};
};
