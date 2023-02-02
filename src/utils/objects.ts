import _ from 'lodash';

export function removeNestedEmptyObjects(obj: any): any {
  if (_.isArray(obj)) {
    return _(obj)
      .filter(_.isObject)
      .map(removeNestedEmptyObjects)
      .reject(_.isEmpty)
      .concat(_.reject(obj, _.isObject))
      .value();
  }
  return _(obj)
    .pickBy(_.isObject)
    .mapValues(removeNestedEmptyObjects)
    .omitBy(_.isEmpty)
    .assign(_.omitBy(obj, _.isObject))
    .value();
}

/**
 *
 * mapKeyValuesFromNestedObjects is a function that takes in a list of objects and a function to extract a nested object from each object in the list.
 * It returns a map of key-values, where the key is the key of the nested object and the value is an array of all unique string values of that key from the nested objects.
 *
 * @param {any[]} inputObjects - The list of objects to be processed
 * @param {function} extractNestedObject - A function that takes in an object and returns the nested object to be processed
 * @returns {Record<string, string[]>} - A map of key-values from the nested objects
 */
export const mapKeyValuesFromNestedObjects = <T extends Record<string, any>, NT extends Record<string, string>>(
  inputObjects: T[],
  extractNestedObject: (sourceObject: T) => NT
): Record<string, string[]> => {
  const keyValues: Record<string, string[]> = {};
  inputObjects.forEach(sourceObject => {
    const nestedObject = extractNestedObject(sourceObject);
    if (nestedObject) {
      Object.entries(nestedObject).forEach(([key, value]) => {
        if (typeof value !== 'string') {
          return;
        }
        if (!keyValues[key]) {
          keyValues[key] = [];
        }
        if (!keyValues[key].includes(value)) {
          keyValues[key].push(value);
        }
      });
    }
  });
  return keyValues;
};
