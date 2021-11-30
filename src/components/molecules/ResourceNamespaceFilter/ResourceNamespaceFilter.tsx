import React, {useMemo} from 'react';

import {Select} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';

import {useNamespaces} from '@hooks/useNamespaces';

const ALL_OPTIONS = '<all>';

function ResourceNamespaceFilter(props: {customNamespaces?: string[]}) {
  const {customNamespaces} = props;
  const dispatch = useAppDispatch();
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const [namespaces] = useNamespaces({extra: ['all', 'default']});

  const currentNamespaces = useMemo(() => {
    if (customNamespaces && customNamespaces.length > 0) {
      return customNamespaces;
    }
    return namespaces;
  }, [customNamespaces, namespaces]);

  const updateNamespace = (selectedNamespace: string) => {
    dispatch(
      updateResourceFilter({
        ...resourceFilter,
        namespace: selectedNamespace === ALL_OPTIONS ? undefined : selectedNamespace,
      })
    );
  };

  return (
    <Select
      showSearch
      defaultValue={ALL_OPTIONS}
      value={resourceFilter.namespace ? resourceFilter.namespace : ALL_OPTIONS}
      onChange={updateNamespace}
      style={{width: '100%'}}
    >
      {currentNamespaces.map(namespace => {
        if (typeof namespace !== 'string') {
          return null;
        }

        return (
          <Select.Option key={namespace} value={namespace}>
            {namespace}
          </Select.Option>
        );
      })}
    </Select>
  );
}

export default ResourceNamespaceFilter;
