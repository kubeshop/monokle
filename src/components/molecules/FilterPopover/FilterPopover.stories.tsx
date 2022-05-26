import {useCallback, useState} from 'react';

import 'antd/dist/antd.dark.css';

import {Filter, FilterPopover} from './FilterPopover';

export function Default() {
  const [filter, setFilter] = useState<Filter | undefined>({namespace: 'demo'});

  const handleFilterChange = useCallback((newFilter: Filter | undefined) => {
    setFilter(newFilter);
  }, []);

  return <FilterPopover filter={filter} onChange={handleFilterChange} />;
}
