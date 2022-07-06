import {shallowEqual} from 'react-redux';

import asyncLib from 'async';
import log from 'loglevel';

import {SectionBlueprint} from '@models/navigator';
import {RootState} from '@models/rootstate';

type ComputeFullScopeProps = {
  sectionBlueprintList: SectionBlueprint<any, any>[];
  state: RootState;
  fullScopeCache: Record<string, any>;
};

export const computeFullScope = async (props: ComputeFullScopeProps) => {
  const {sectionBlueprintList, state, fullScopeCache} = props;
  const fullScope: Record<string, any> = {};
  const scopeKeysBySectionId: Record<string, string[]> = {};
  const isChangedByScopeKey: Record<string, boolean> = {};

  // check if anything from the full scope has changed and store the keys of changed values
  await asyncLib.each(sectionBlueprintList, async sectionBlueprint => {
    const sectionScope = sectionBlueprint.getScope(state);
    const sectionScopeKeys: string[] = [];
    Object.entries(sectionScope).forEach(([key, value]) => {
      sectionScopeKeys.push(key);
      // if the key is already in the current full scope, skip this
      if (fullScope[key]) {
        return;
      }
      fullScope[key] = value;
      if (!fullScopeCache[key]) {
        // if the key is not in the cache, add it and set that the scope key has changed
        fullScopeCache[key] = value;
        isChangedByScopeKey[key] = true;
      } else {
        const hasScopeKeyValueChanged = !shallowEqual(fullScopeCache[key], value);
        if (hasScopeKeyValueChanged) {
          isChangedByScopeKey[key] = true;
        } else {
          isChangedByScopeKey[key] = false;
        }
      }
    });
    scopeKeysBySectionId[sectionBlueprint.id] = sectionScopeKeys;
  });

  return {
    fullScope,
    scopeKeysBySectionId,
    isChangedByScopeKey,
  };
};

type HasFullScopeChangedProps = {
  isChangedByScopeKey: Record<string, boolean>;
};

export const hasFullScopeChanged = (props: HasFullScopeChangedProps) => {
  const {isChangedByScopeKey} = props;
  if (Object.values(isChangedByScopeKey).every(isChanged => isChanged === false)) {
    log.debug('fullScope did not change.');
    return false;
  }
  return true;
};

type HasSectionScopeChanged = {
  isChangedByScopeKey: Record<string, boolean>;
  sectionScopeKeys: string[];
};
export const hasSectionScopeChanged = (props: HasSectionScopeChanged) => {
  const {isChangedByScopeKey, sectionScopeKeys} = props;
  return Object.entries(isChangedByScopeKey).some(([key, value]) => sectionScopeKeys.includes(key) && value === true);
};
