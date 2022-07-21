const pty = require('node-pty');
const os = require('os');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
