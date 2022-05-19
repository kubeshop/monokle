// const {exec} = require('child_process');
// const path = require('path');

exports.default = async function (configuration) {
  console.log('configuration', configuration);
  console.log('ENV', process.env.AZURE_CREDENTIALS.activeDirectoryEndpointUrl);
};
