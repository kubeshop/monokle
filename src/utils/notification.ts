import {useMemo} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';

export const enhanceErrorMessage = (message: string) => {
  const isUnauthorizedError = message.toLowerCase().includes('unauthorized');

  if (isUnauthorizedError) {
    return `We're sorry, it looks like you're not authorized to connect to this cluster. Please take a look at our [troubleshooting guide for cluster connections in our documentation](https://kubeshop.github.io/monokle/cluster-issues/) for steps on how to resolve this issue.\n\nError:\n${message}`;
  }

  return message;
};

export function useNotifications() {
  const dispatch = useAppDispatch();

  const notify = useMemo(() => {
    return notificationsClient(dispatch);
  }, [dispatch]);

  return notify;
}

export type NotificationArgs = {
  type: AlertEnum;
  title: string;
  description?: string;
  duration?: number;
  silent?: boolean;
};

export const notificationsClient = (dispatch: AppDispatch) => {
  const notifyFn = (args: NotificationArgs) => {
    dispatch(
      dispatch(
        setAlert({
          title: args.title,
          type: args.type,
          message: args?.description ?? '',
          duration: args?.duration,
          silent: args?.silent,
        })
      )
    );
  };

  notifyFn.error = (title: string, args?: Omit<NotificationArgs, 'type' | 'title'>) =>
    dispatch(
      setAlert({
        title,
        type: AlertEnum.Error,
        message: args?.description ?? '',
        duration: args?.duration,
        silent: args?.silent,
      })
    );

  notifyFn.success = (title: string, args?: Omit<NotificationArgs, 'type' | 'title'>) =>
    dispatch(
      setAlert({
        title,
        type: AlertEnum.Success,
        message: args?.description ?? '',
        duration: args?.duration,
        silent: args?.silent,
      })
    );

  notifyFn.info = (title: string, args?: Omit<NotificationArgs, 'type' | 'title'>) =>
    dispatch(
      setAlert({
        title,
        type: AlertEnum.Info,
        message: args?.description ?? '',
        duration: args?.duration,
        silent: args?.silent,
      })
    );

  notifyFn.warning = (title: string, args?: Omit<NotificationArgs, 'type' | 'title'>) =>
    dispatch(
      setAlert({
        title,
        type: AlertEnum.Warning,
        message: args?.description ?? '',
        duration: args?.duration,
        silent: args?.silent,
      })
    );

  return notifyFn;
};
