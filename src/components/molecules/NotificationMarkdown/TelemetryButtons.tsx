import {notification} from 'antd';

import {toggleErrorReporting, toggleEventTracking, updateTelemetry} from '@redux/reducers/appConfig';
import {setActiveSettingsPanel, toggleNotifications} from '@redux/reducers/ui';
import store from '@redux/store';

import {SettingsPanel} from '@shared/models/config';

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

    // TODO: Do we still need to toggle settings?
    // store.dispatch(toggleSettings());
    store.dispatch(toggleNotifications());
    store.dispatch(toggleEventTracking(false));
    store.dispatch(toggleErrorReporting(false));
  };

  const handleOk = () => {
    disableTelemetryNotification();

    store.dispatch(toggleNotifications());
  };

  if (disableEventTracking !== undefined || disableErrorReporting !== undefined) {
    return <div>Your settings have been saved.</div>;
  }

  return (
    <S.Content>
      <S.Button type="default" onClick={handleOk} id="accept-telemetry">
        I&apos;m fine with it
      </S.Button>
      <S.Button type="text" onClick={handleNotOk} id="decline-telemetry">
        I&apos;m not
      </S.Button>
    </S.Content>
  );
};
