import {sep} from 'path';

export const generateExpandedPaths = (items: string[], currentExpandedPaths: string[]) => {
  let result: string[] = [];
  let currentPath = '';

  for (let i = 0; i < items.length; i += 1) {
    currentPath += sep + items[i];

    if (!currentExpandedPaths.includes(currentPath)) {
      result.push(currentPath);
    }
  }

  return result;
};
