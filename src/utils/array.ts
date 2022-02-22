/**
 * Mutates an array by moving an element from an index to another
 * @param array
 * @param fromIndex
 * @param toIndex
 */
export function arrayMoveMutate<T>(array: T[], fromIndex: number, toIndex: number) {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;
  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;
    const [element] = array.splice(fromIndex, 1);
    array.splice(endIndex, 0, element);
  }
}

/**
 * Returns a copy of the array with an element moved from an index to another
 */
export function arrayMove<T>(array: T[], fromIndex: number, toIndex: number) {
  const arrayCopy = array.slice();
  arrayMoveMutate(arrayCopy, fromIndex, toIndex);
  return arrayCopy;
}
