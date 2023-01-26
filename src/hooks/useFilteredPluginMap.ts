import {useMemo} from 'react';

import {isEmpty} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {AnyPlugin} from '@shared/models/plugin';

export function useFilteredPluginMap(searchValue: string) {
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const templateMap = useAppSelector(state => state.extension.templateMap);

  const filteredPluginMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(pluginMap).reduce<[string, AnyPlugin][]>((acc, [currentPath, currentPlugin]) => {
          const newValue = {
            ...currentPlugin,
            modules: currentPlugin.modules.filter(module =>
              templateMap[module.path].name.toLowerCase().includes(searchValue.toLowerCase())
            ),
          };

          if (isEmpty(newValue.modules)) {
            return acc;
          }

          return [...acc, [currentPath, newValue]];
        }, [])
      ),
    [pluginMap, searchValue, templateMap]
  );

  return filteredPluginMap;
}
