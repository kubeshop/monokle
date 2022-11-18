import {Button} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {openSaveEditCommandModal} from '@redux/reducers/ui';

const SaveCommand = () => {
  const dispatch = useAppDispatch();

  return (
    <>
      <Button type="link" onClick={() => dispatch(openSaveEditCommandModal({}))}>
        Save command
      </Button>
    </>
  );
};

export default SaveCommand;
