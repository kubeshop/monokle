const waitOn = require('wait-on');

async function createWindow() {
  await waitOn({
    resources: ['http://127.0.0.1:3000'],
    validateStatus: status => {
      return status >= 200 && status < 300; // default if not provided
    },
  });
}

createWindow();
