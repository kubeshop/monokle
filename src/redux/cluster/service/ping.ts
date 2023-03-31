import {invokeIpc} from '@utils/ipc';

import type {PingParams, PingResult} from '@shared/ipc';

/**
 * Example usage:
 *
 * ```
 * try {
 *   const { ok } = await ping({ context: "minikube" })
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const ping = invokeIpc<PingParams, PingResult>('cluster:ping');
