import {type, release} from 'os';
import {machineIdSync} from 'node-machine-id';
import {app} from 'electron';
import electronStore from '@shared/utils/electronStore';

const CLIENT_NAME = 'Monokle Desktop';

export function getClientConfig() {
	const isTrackingDisabled = Boolean(electronStore.get('appConfig.disableEventTracking'));
	const additionalData = isTrackingDisabled ? undefined : { machineId: machineIdSync() };

	return {
		name: CLIENT_NAME,
		version: app.getVersion(),
		os: `${type()} ${release()}`,
		additionalData,
	};
}
