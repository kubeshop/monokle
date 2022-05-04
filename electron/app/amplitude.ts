import * as Amplitude from '@amplitude/node';

let amplitudeClient: Amplitude.NodeClient | undefined;

if (process.env.AMPLITUDE_API_KEY) {
  amplitudeClient = Amplitude.init(process.env.AMPLITUDE_API_KEY);
}

export const getAmplitudeClient = () => amplitudeClient;
