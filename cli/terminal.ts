const path = require('path');
const fs = require('fs');

const getResourcesPath = () => (<any>process).resourcesPath;

const LINUX_PATH = '/usr/bin';
const MACOS_PATH ='/usr/local/bin';

export default (): Promise<void> => {
  const commandPath = path.resolve(getResourcesPath(), `app/darwin/bin/monokle.sh`);
  const commandName = 'monokle';

  return new Promise((resolve, reject) => {
    if (typeof commandPath !== 'string' || typeof commandName !== 'string') {
      reject(new TypeError('Expected a string'));
    }

    if (!(process.platform === 'darwin' || process.platform === 'linux')) {
      reject(new Error('Your platform is not supported'));
    }

    let destinationPath:string = path.join(MACOS_PATH, commandName);
    if(process.platform === 'linux') {
      destinationPath = path.join(LINUX_PATH, commandName);
    }

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

        fs.symlink(commandPath, destinationPath, (e: any) => {
          if (e) {
            reject(e);
          }
          resolve();
        });
      });
    });
  });
};
