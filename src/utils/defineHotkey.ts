export const defineHotkey = (hotkey: string) => {
  const shortcuts = hotkey.split(' ');
  if (shortcuts.length < 2) return hotkey;
  const darwinShortcuts = shortcuts.filter(shortcut => shortcut.includes('command') || shortcut.includes('cmd'));
  const windowsShortcuts = shortcuts.filter(shortcut => !shortcut.includes('command') && !shortcut.includes('cmd'));
  return process.platform === 'darwin'
    ? darwinShortcuts.join().replace(',', '')
    : windowsShortcuts.join().replace(',', '');
};
