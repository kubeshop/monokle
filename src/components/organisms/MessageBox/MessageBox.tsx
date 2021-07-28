import {notification} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {clearAlert} from '@redux/reducers/alert';

const MessageBox = () => {
  const dispatch = useAppDispatch();
  const alert = useAppSelector(state => state.alert.alert);

  const clear = () => {
    dispatch(clearAlert());
  };

  if (alert) {
    let type: 'success' | 'info' | 'warning' | 'error' | undefined = 'success';

    notification[type]({
      message: alert.title,
      description: alert.message,
      onClick: () => {
        clear();
      },
      onClose: () => {
        clear();
      },
    });
  }

  return (<span />);
};

export default MessageBox;
