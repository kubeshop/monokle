import {isArray, mergeWith} from 'lodash';
import {PartialDeep} from 'type-fest';

import {FakeMainState} from '../../CompareState';

export function compareStateFixture(args?: PartialDeep<FakeMainState>): Partial<FakeMainState> {
  const defaults = {
    diff: {
      views: [],
      current: {
        view: {
          leftSet: undefined,
          rightSet: undefined,
          operation: 'union',
        },
        left: undefined,
        right: undefined,
        diff: undefined,
        selection: [],
      },
    },
  };
  return mergeWith(defaults, args, (_a, b) => (isArray(b) ? b : undefined));
}
