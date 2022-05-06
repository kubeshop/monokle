import {notification} from 'antd';

import {toggleErrorReporting, toggleEventTracking, updateTelemetry} from '@redux/reducers/appConfig';
import {setActiveSettingsPanel, toggleNotifications, toggleSettings} from '@redux/reducers/ui';
import store from '@redux/store';

import {SettingsPanel} from '@organisms/SettingsManager/types';

import * as S from './styled';

export const TelemetryButtons = ({notificationId}: {notificationId?: string}) => {
  const disableEventTracking = store.getState().config.disableEventTracking;
  const disableErrorReporting = store.getState().config.disableEventTracking;

  const disableTelemetryNotification = () => {
    store.dispatch(
      updateTelemetry({
        disableEventTracking: false,
        disableErrorReporting: false,
      })
    );

    if (notificationId) {
      notification.close(notificationId);
    }
  };

  const handleNotOk = () => {
    disableTelemetryNotification();

    store.dispatch(setActiveSettingsPanel(SettingsPanel.GlobalSettings));
    store.dispatch(toggleSettings());
    store.dispatch(toggleNotifications());
    store.dispatch(toggleEventTracking(false));
    store.dispatch(toggleErrorReporting(false));
  };

  const handleOk = () => {
    disableTelemetryNotification();
    if (notificationId) {
      return;
    }
    store.dispatch(toggleNotifications());
  };

  if (disableEventTracking !== undefined || disableErrorReporting !== undefined) {
    return <div>Your settings have been saved.</div>;
  }

  return (
    <div>
      <S.Button type="default" onClick={handleOk}>
        I&apos;m fine with it
      </S.Button>
      <S.Button type="text" onClick={handleNotOk}>
        I&apos;m not
      </S.Button>
    </div>
  );
};
