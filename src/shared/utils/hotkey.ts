export const defineHotkey = (hotkey: string) => {
  const shortcuts = hotkey.includes('&') ? hotkey.split('&') : hotkey.split(',');

  if (shortcuts.length < 2) {
    return hotkey;
  }

  const darwinShortcuts = shortcuts.filter(shortcut => shortcut.includes('Meta'));
  const windowsShortcuts = shortcuts.filter(shortcut => !shortcut.includes('Meta'));

  return process.platform === 'darwin' ? darwinShortcuts.join() : windowsShortcuts.join();
};
