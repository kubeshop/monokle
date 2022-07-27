import {useAppDispatch} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';

export const useCreate = () => {
  const dispatch = useAppDispatch();

  const onCreateResource = ({targetFolder, targetFile}: {targetFolder?: string; targetFile?: string}) => {
    if (targetFolder) {
      dispatch(openNewResourceWizard({defaultInput: {targetFolder}}));
    }
    if (targetFile) {
      dispatch(openNewResourceWizard({defaultInput: {targetFile}}));
    }
  };

  return {onCreateResource};
};
