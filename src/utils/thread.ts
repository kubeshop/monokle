/**
 * Inspired by https://github.com/jprichardson/is-electron-renderer
 */

export function isRendererThread() {
  // running in a web browser
  if (typeof process === 'undefined') return true;

  // node-integration is disabled
  if (!process) return true;

  // We're in node.js somehow
  if (!process.type) return false;

  return process.type === 'renderer';
}

export function ensureMainThread(message?: string) {
  if (isRendererThread()) {
    throw new Error(message || 'Not running in main thread');
  }
}

export function ensureRendererThread(message?: string) {
  if (!isRendererThread()) {
    throw new Error(message || 'Not running in renderer thread');
  }
}
