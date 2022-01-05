import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {AutoComplete, Input, Modal, Tag} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource, updateResourceFilter} from '@redux/reducers/main';
import {closeQuickSearchActionsPopup} from '@redux/reducers/ui';

import {useNamespaces} from '@hooks/useNamespaces';

import Colors from '@styles/Colors';

import {ResourceKindHandlers} from '@src/kindhandlers';

import LabelMapper from './LabelMapper';

const StyledModal = styled(Modal)`
  & .ant-input {
    height: 34px;
  }

  & .ant-input:focus {
    box-shadow: none !important;
  }

  & .ant-input-search-button {
    border: 0px !important;
  }

  & .ant-input-group-addon {
    border: 1px solid rgb(67, 67, 67) !important;
  }

  & .ant-select-focused .ant-input-group-addon {
    border: 1px solid #165996 !important;
    border-left-width: 0px !important;
  }
`;

const KnownResourceKinds = ResourceKindHandlers.map(kindHandler => kindHandler.kind);

const QuickSearchActionsV3: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const [namespaces] = useNamespaces({extra: ['default']});

  const [searchingValue, setSearchingValue] = useState<string>('');

  const allResourceKinds = useMemo(() => {
    return [
      ...new Set([
        ...KnownResourceKinds,
        ...Object.values(resourceMap)
          .filter(r => !KnownResourceKinds.includes(r.kind))
          .map(r => r.kind),
      ]),
    ].sort();
  }, [resourceMap]);

  const applyOption = useCallback(
    (type: string, option: string) => {
      if (type === 'namespace' && (!resourceFilter.namespace || resourceFilter.namespace !== option)) {
        dispatch(updateResourceFilter({...resourceFilter, namespace: option}));
      } else if (type === 'kind' && (!resourceFilter.kind || resourceFilter.kind !== option)) {
        dispatch(updateResourceFilter({...resourceFilter, kind: option}));
      } else if (type === 'resource' && selectedResourceId !== option) {
        dispatch(updateResourceFilter({labels: {}, annotations: {}}));
        dispatch(selectK8sResource({resourceId: option}));
      }
    },
    [dispatch, resourceFilter, selectedResourceId]
  );

  const closeModalHandler = useCallback(() => {
    setSearchingValue('');
    dispatch(closeQuickSearchActionsPopup());
  }, [dispatch]);

  const matchingCharactersLabel = useCallback(
    (label: string, type: string) => {
      const inputValue = searchingValue.replaceAll('\\', '\\\\');
      const regex = new RegExp(`(${inputValue})`, 'gi');
      const parts = label.split(regex);

      return parts.map((part, index) => {
        const key = `${type}-${label}-${index}`;

        if (part) {
          if (part.toLowerCase() === searchingValue) {
            return (
              <span key={key} style={{color: Colors.cyan7}}>
                {part}
              </span>
            );
          }
          return part;
        }

        return '';
      });
    },
    [searchingValue]
  );

  const options = useMemo(() => {
    const namespaceOptions = namespaces.reduce((filteredOpt, ns) => {
      if (ns.toLowerCase().includes(searchingValue.toLowerCase())) {
        const optionLabel = <span>{matchingCharactersLabel(ns, 'namespace')}</span>;

        filteredOpt.push({value: `namespace:${ns}`, label: optionLabel});
      }

      return filteredOpt;
    }, [] as {value: string; label: JSX.Element}[]);

    const kindOptions = allResourceKinds.reduce((filteredOpt, kind) => {
      if (kind.toLowerCase().includes(searchingValue.toLowerCase())) {
        const optionLabel = <span>{matchingCharactersLabel(kind, 'kind')}</span>;

        filteredOpt.push({value: `kind:${kind}`, label: optionLabel});
      }

      return filteredOpt;
    }, [] as {value: string; label: JSX.Element}[]);

    const resourceOptions = Object.entries(resourceMap).reduce((filteredOpt, resourceEntry) => {
      if (resourceEntry[1].name.toLowerCase().includes(searchingValue.toLowerCase())) {
        const optionLabel = (
          <div>
            {resourceEntry[1].namespace && <Tag>{resourceEntry[1].namespace}</Tag>}
            <span>{matchingCharactersLabel(resourceEntry[1].name, 'resource')}</span>
            {resourceEntry[1].kind && (
              <span style={{fontStyle: 'italic', marginLeft: '8px', color: Colors.grey6}}>{resourceEntry[1].kind}</span>
            )}
          </div>
        );

        filteredOpt.push({value: `resource:${resourceEntry[0]}`, label: optionLabel});
      }

      return filteredOpt;
    }, [] as {value: string; label: JSX.Element}[]);

    return [
      {label: LabelMapper['kind'], options: kindOptions},
      {label: LabelMapper['namespace'], options: namespaceOptions},
      {label: LabelMapper['resource'], options: resourceOptions},
    ];
  }, [allResourceKinds, matchingCharactersLabel, namespaces, resourceMap, searchingValue]);

  useEffect(() => {
    if (isOpen) {
      document.getElementById('quick-search-input')?.focus();
    }
  }, [isOpen]);

  return (
    <StyledModal
      bodyStyle={{padding: '0px'}}
      closable={false}
      destroyOnClose
      footer={null}
      visible={isOpen}
      onCancel={closeModalHandler}
    >
      <AutoComplete
        id="quick-search-input"
        autoFocus
        defaultOpen
        options={options}
        style={{width: '100%'}}
        value={searchingValue}
        onSearch={value => setSearchingValue(value)}
        onSelect={value => {
          // options are of type : `type:value`
          applyOption(value.split(':')[0], value.split(':')[1]);
          closeModalHandler();
        }}
        filterOption={(inputValue, opt) => {
          if (opt?.options?.length) {
            return true;
          }

          return false;
        }}
      >
        <Input.Search placeholder="Search by namespace, kind and resource" />
      </AutoComplete>
    </StyledModal>
  );
};

export default QuickSearchActionsV3;
