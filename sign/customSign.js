const {exec} = require('child_process');
const log = require('loglevel');

const KVU = 'https://monokle-signing.vault.azure.net';
const TR = 'http://timestamp.digicert.com';

const signTask = commandToRun =>
  new Promise((resolve, reject) => {
    exec(commandToRun, {stdio: 'pipe'}, (error, stdout, stderr) => {
      log.error(stderr);
      if (error) {
        log.error(error);
        reject(error);
      } else {
        resolve();
      }
    });
  });

exports.default = async function customSign(configuration) {
  const AZURE_CREDENTIALS = JSON.parse(process.env.AZURE_CREDENTIALS);
  const command = `AzureSignTool sign -kvu ${KVU} -kvi ${AZURE_CREDENTIALS.clientId} -kvs ${AZURE_CREDENTIALS.clientSecret} -kvc monokle-signing -kvt ${AZURE_CREDENTIALS.tenantId} -tr ${TR} -v ${configuration.path}`;
  await signTask(command);
};

export default customSign;
