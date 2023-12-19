import {type, release} from 'os';
import {machineIdSync} from 'node-machine-id';
import {app} from 'electron';

const CLIENT_NAME = 'Monokle Desktop';

export function getClientConfig() {
	return {
		name: CLIENT_NAME,
		version: app.getVersion(),
		os: `${type()} ${release()}`,
		additionalData: {
			machineId: machineIdSync(),
		}
	};
}
