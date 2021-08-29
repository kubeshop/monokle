'use strict';
const path = require('path');
const fs = require('fs');

const getResourcesPath = () => process.resourcesPath;

export default (): Promise<void> => {
  const commandPath = path.resolve(getResourcesPath(), `app/darwin/bin/monokle.sh`);
  const commandName = 'monokle';

  return new Promise((resolve, reject) => {
    if (typeof commandPath !== 'string' || typeof commandName !== 'string') {
      reject(new TypeError('Expected a string'));
    }

    if (process.platform !== 'darwin') {
      reject(new Error('Your platform is not supported'));
    }

    const destinationPath = path.join('/usr/local/bin', commandName);

    // not catch Error
    fs.readlink(destinationPath, (_: any, realPath: string) => {
      if (realPath === commandPath) {
        resolve();
        return;
      }

      fs.unlink(destinationPath, (err: any) => {
        if (err && err.code && err.code !== 'ENOENT') {
          reject(err);
        }

        fs.symlink(commandPath, destinationPath, (err: any) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    });
  });
};
