import React from 'react';

import {updateTelemetry} from '@redux/reducers/appConfig';
import {setActiveSettingsPanel, toggleNotifications, toggleSettings} from '@redux/reducers/ui';
import store from '@redux/store';

import {SettingsPanel} from '@organisms/SettingsManager/types';

import * as S from './styled';

export const TelemetryButtons = () => {
  const disableTelemetryNotification = () => {
    store.dispatch(
      updateTelemetry({
        disableEventTracking: false,
        disableErrorReporting: false,
      })
    );
  };

  const handleNotOk = () => {
    disableTelemetryNotification();

    store.dispatch(setActiveSettingsPanel(SettingsPanel.GlobalSettings));
    store.dispatch(toggleSettings());
    store.dispatch(toggleNotifications());
  };

  const handleOk = () => {
    disableTelemetryNotification();
    store.dispatch(toggleNotifications());
  };

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
