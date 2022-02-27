import * as Mixpanel from 'mixpanel';
import {machineIdSync} from 'node-machine-id';
import Nucleus from 'nucleus-nodejs';

const mixpanel = Mixpanel.init('51467136dd49f26dbd94427631cc843e');
mixpanel.people.set(machineIdSync(), {
  os: process.platform,
});

export const trackEvent = (eventName: string, payload?: any) => {
  Nucleus.track(eventName, {...payload});
  mixpanel.track(eventName, {...payload});
};
