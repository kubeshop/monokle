import {notification} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {clearAlert} from '@redux/reducers/alert';
import {AlertEnum} from '@models/alert';

const MessageBox = () => {
  const dispatch = useAppDispatch();
  const alert = useAppSelector(state => state.alert.alert);

  const clear = () => {
    dispatch(clearAlert());
  };

  if (alert) {
    let type: any = alert.type === AlertEnum.Error ? 'error' :
      alert.type === AlertEnum.Warning ? 'warning' :
        alert.type === AlertEnum.Success ? 'success' : 'info';

    // @ts-ignore
    notification[type]({
      message: alert.title,
      description: alert.message,
      onClick: () => {
        clear();
      },
      onClose: () => {
        clear();
      },
      duration: type === 'error' ? 0 : 4,
    });
  }

  return (null);
};

export default MessageBox;
