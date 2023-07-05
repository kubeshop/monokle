import Analytics from 'analytics-node';
import log from 'loglevel';

import electronStore from './electronStore';
import {isRendererThread} from './thread';

let client: Analytics | undefined;

const disableTracking = Boolean(electronStore.get('appConfig.disableEventTracking'));

export const getSegmentClient = () => client;

export const enableSegment = () => {
  if (process.env.SEGMENT_API_KEY && !client) {
    log.info('Enabled Segment');
    client = new Analytics(process.env.SEGMENT_API_KEY, {flushAt: 1, errorHandler: log.error});
  }
};

export const disableSegment = () => {
  client = undefined;
};

if (!isRendererThread() && !disableTracking) {
  enableSegment();
}
