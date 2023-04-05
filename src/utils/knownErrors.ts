const knownErrors = [
  'ResizeObserver loop completed with undelivered notifications',
  'ResizeObserver loop limit exceeded',
];

export const ignoreKnownErrors = () => {
  window.addEventListener('error', e => {
    if (knownErrors.some(error => e.message.includes(error))) {
      e.stopImmediatePropagation();
    }
  });
};
