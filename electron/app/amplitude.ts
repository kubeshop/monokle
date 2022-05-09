import electronStore from '@utils/electronStore';

import * as Amplitude from '@amplitude/node';

let amplitudeClient: Amplitude.NodeClient | undefined;
const disableTracking = Boolean(electronStore.get('appConfig.disableEventTracking'));

export const getAmplitudeClient = () => amplitudeClient;

export const enableAmplitude = () => {
  if (process.env.AMPLITUDE_API_KEY) {
    amplitudeClient = Amplitude.init(process.env.AMPLITUDE_API_KEY);
  }
};

export const disableAmplitude = () => {
  amplitudeClient = undefined;
};

if (!disableTracking) {
  enableAmplitude();
}
