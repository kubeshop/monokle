import React from 'react';
import {Select} from 'antd';
import {useNamespaces} from '@hooks/useNamespaces';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';

const ALL_OPTIONS = '<all>';

function ResourceNamespaceFilter() {
  const dispatch = useAppDispatch();
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const allNamespaces = useNamespaces({extra: ['all', 'default']});

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
      {allNamespaces.map(ns => (
        <Select.Option key={ns} value={ns}>
          {ns}
        </Select.Option>
      ))}
    </Select>
  );
}

export default ResourceNamespaceFilter;
