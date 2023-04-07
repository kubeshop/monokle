import {invokeIpc} from '@utils/ipc';

/**
 * Example usage:
 *
 * ```
 * try {
 *   const isInstalled = await isGitInstalled({});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const isGitInstalled = invokeIpc<{}, boolean>('git:isGitInstalled');
