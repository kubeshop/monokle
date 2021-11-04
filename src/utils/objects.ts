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
