import {ipcRenderer} from 'electron';

import {machineIdSync} from 'node-machine-id';

import {Event, EventMap} from '@shared/models/telemetry';

import {getSegmentClient} from './segment';
import {isRendererThread} from './thread';

const machineId: string = machineIdSync();

export const trackEvent = <TEvent extends Event>(eventName: TEvent, payload?: EventMap[TEvent]) => {
  if (isRendererThread()) {
    ipcRenderer.send('track-event', {eventName, payload});
  } else {
    const segmentClient = getSegmentClient();
    segmentClient?.track({
      event: eventName,
      properties: payload,
      userId: machineId,
    });
  }
};
export const trackError = (error: any) => {
  if (isRendererThread()) {
    ipcRenderer.send('track-event', {eventName: 'Error', payload: error});
  } else {
    const segmentClient = getSegmentClient();
    segmentClient?.track({
      event: 'Error',
      properties: error,
      userId: machineId,
    });
  }
};
