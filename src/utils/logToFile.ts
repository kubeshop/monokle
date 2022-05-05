import * as electronLog from 'electron-log';

electronLog.transports.file.maxSize = 2097152; // 2MB .log file size

// process.env.NODE_ENV === 'production';

export const logToFile = electronLog;
