import {TextDecoder, TextEncoder} from 'util';

global.setImmediate = jest.useRealTimers;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
