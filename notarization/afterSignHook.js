/* eslint-disable */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const log = require('loglevel');
var electron_notarize = require('@electron/notarize');

module.exports = async function (params) {
  // Only notarize the app if building for macOS and the NOTARIZE environment
  // variable is present.
  if (!process.env.NOTARIZE || process.platform !== 'darwin') {
    return;
  }
  log.info('afterSign hook triggered', params);

  const package = require(path.join(process.cwd(), './package.json'));

  // This should match the appId from electron-builder. It reads from
  // package.json so you won't have to maintain two separate configurations.
  let appId = package.build.appId;
  if (!appId) {
    console.error("appId is missing from build configuration 'package.json'");
  }

  let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  log.info(`Notarizing ${appId} found at ${appPath}`);

  try {
    await electron_notarize.notarize({
      tool: 'notarytool',
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    });
  } catch (error) {
    log.error(error);
  }

  log.info(`Done notarizing ${appId}`);
};
