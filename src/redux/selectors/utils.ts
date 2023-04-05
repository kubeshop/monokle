import {createSelectorCreator, defaultMemoize} from 'reselect';

import {isEqual} from '@shared/utils/isEqual';

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);
