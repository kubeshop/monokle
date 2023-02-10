import fastDeepEqual from 'fast-deep-equal';
import {createSelectorCreator, defaultMemoize} from 'reselect';

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, fastDeepEqual);
