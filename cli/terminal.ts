'use strict';
const path = require('path');
const fs = require('fs');

const installCommand = (commandPath: string, commandName: string): Promise<void> => {
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

const getResourcesPath = () => process.resourcesPath;

export default async () => {
  const output = fs.readFileSync(path.resolve(__dirname, '../../cli/open.sh'), 'utf8');
  const outputPath = path.resolve(getResourcesPath(), `monokle.sh`);
  fs.writeFileSync(outputPath, output, {
    encoding: 'utf8',
    flag: 'a+',
    mode: 0o755,
  });
  await installCommand(outputPath, 'monokle');
};
