import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {AutoComplete, Input, Modal, Tag} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {AppDispatch} from '@models/appdispatch';
import {ResourceFilterType} from '@models/appstate';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {resetResourceFilter, selectK8sResource, updateResourceFilter} from '@redux/reducers/main';
import {closeQuickSearchActionsPopup} from '@redux/reducers/ui';
import {knownResourceKindsSelector} from '@redux/selectors';

import {useNamespaces} from '@hooks/useNamespaces';

import {isResourcePassingFilter} from '@utils/resources';
import {QUICK_SEARCH, trackEvent} from '@utils/telemetry';

import Colors from '@styles/Colors';

import LabelMapper from './LabelMapper';

const StyledModal = styled(Modal)`
  & .ant-input {
    height: 34px;
  }

  & .ant-input:focus {
    box-shadow: none !important;
  }

  & .ant-input:hover + .ant-input-group-addon {
    border: 1px solid #165996 !important;
  }

  & .ant-input-search-button {
    border: 0px !important;
  }

  & .ant-input-group-addon {
    border: 1px solid rgb(67, 67, 67) !important;
  }

  & .ant-select-focused .ant-input-group-addon {
    border: 1px solid #165996 !important;
  }
`;

const applyFilterWithConfirm = (
  option: string,
  type: 'namespace' | 'kinds',
  resourceFilter: ResourceFilterType,
  dispatch: AppDispatch
) => {
  let title = `Are you sure you want apply ${option} ${type} filter? It will replace the currently applied ${resourceFilter[type]} ${type} filter.`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        dispatch(
          updateResourceFilter({
            ...resourceFilter,
            [type]: type === 'kinds' ? [option] : option,
          })
        );
        dispatch(closeQuickSearchActionsPopup());
        resolve({});
      });
    },
    onCancel() {
      document.getElementById('quick_search_input')?.focus();
    },
  });
};

const selectK8sResourceWithConfirm = (resourceId: string, resourceName: string, dispatch: AppDispatch) => {
  let title = `Are you sure you want to select ${resourceName}? It will reset the currently applied filters.`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        dispatch(resetResourceFilter());
        dispatch(selectK8sResource({resourceId}));
        dispatch(closeQuickSearchActionsPopup());
        resolve({});
      });
    },
    onCancel() {
      document.getElementById('quick_search_input')?.focus();
    },
  });
};

const QuickSearchActionsV3: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);

  const [namespaces] = useNamespaces({extra: ['default']});

  const [searchingValue, setSearchingValue] = useState<string>('');

  const allResourceKinds = useMemo(() => {
    return [
      ...new Set([
        ...knownResourceKinds,
        ...Object.values(resourceMap)
          .filter(r => !knownResourceKinds.includes(r.kind))
          .map(r => r.kind),
      ]),
    ].sort();
  }, [knownResourceKinds, resourceMap]);

  const filteredResources = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(resourceMap).filter(([, resource]) => isResourcePassingFilter(resource, resourceFilter))
      ),
    [resourceFilter, resourceMap]
  );

  const applyOption = useCallback(
    (type: string, option: string) => {
      if (type === 'namespace' || type === 'kinds') {
        if (resourceFilter[type]) {
          if (resourceFilter[type] !== option) {
            applyFilterWithConfirm(option, type, resourceFilter, dispatch);
          }
        } else {
          dispatch(
            updateResourceFilter({
              ...resourceFilter,
              [type]: type === 'kinds' ? [option] : option,
            })
          );
          dispatch(closeQuickSearchActionsPopup());
        }
      } else if (type === 'resource') {
        if (!filteredResources[option]) {
          selectK8sResourceWithConfirm(option, resourceMap[option].name, dispatch);
        } else {
          if (selectedResourceId !== option) {
            dispatch(selectK8sResource({resourceId: option}));
          }
          dispatch(closeQuickSearchActionsPopup());
        }
      }
    },
    [dispatch, filteredResources, resourceFilter, resourceMap, selectedResourceId]
  );

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
    const namespaceOptions = namespaces
      .sort((a, b) => a.localeCompare(b))
      .reduce((filteredOpt, ns) => {
        if (ns.toLowerCase().includes(searchingValue.toLowerCase())) {
          const optionLabel = <span>{matchingCharactersLabel(ns, 'namespace')}</span>;

          filteredOpt.push({value: `namespace:${ns}`, label: optionLabel});
        }

        return filteredOpt;
      }, [] as {value: string; label: JSX.Element}[]);

    const kindOptions = allResourceKinds.reduce((filteredOpt, kind) => {
      if (kind.toLowerCase().includes(searchingValue.toLowerCase())) {
        const optionLabel = <span>{matchingCharactersLabel(kind, 'kind')}</span>;

        filteredOpt.push({value: `kinds:${kind}`, label: optionLabel});
      }

      return filteredOpt;
    }, [] as {value: string; label: JSX.Element}[]);

    const resourceOptions = Object.entries(resourceMap)
      .sort((a, b) => {
        const resA = a[1];
        const resB = b[1];
        if (resA.kind !== resB.kind) {
          return resA.kind.localeCompare(resB.kind);
        }
        if (resA.namespace && !resB.namespace) {
          return -1;
        }
        if (!resA.namespace && resB.namespace) {
          return 1;
        }
        if (resA.namespace && resB.namespace && resA.namespace !== resB.namespace) {
          return resA.namespace.localeCompare(resB.namespace);
        }
        return resA.name.localeCompare(resB.name);
      })
      .reduce((filteredOpt, resourceEntry) => {
        const resourceName = resourceEntry[1].name;

        if (!resourceName.startsWith('Patch:') && resourceName.toLowerCase().includes(searchingValue.toLowerCase())) {
          const optionLabel = (
            <div>
              {resourceEntry[1].namespace && <Tag>{resourceEntry[1].namespace}</Tag>}
              <span>{matchingCharactersLabel(resourceName, 'resource')}</span>
              {resourceEntry[1].kind && (
                <span style={{fontStyle: 'italic', marginLeft: '8px', color: Colors.grey7}}>
                  {resourceEntry[1].kind}
                </span>
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

  const previousInputListFirstChild = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      trackEvent(QUICK_SEARCH);
      setSearchingValue('');
    }
  }, [isOpen]);

  return (
    <StyledModal
      bodyStyle={{padding: '0px'}}
      closable={false}
      destroyOnClose
      footer={null}
      visible={isOpen}
      onCancel={() => dispatch(closeQuickSearchActionsPopup())}
    >
      <AutoComplete
        id="quick_search_input"
        autoFocus
        defaultActiveFirstOption
        listHeight={500}
        notFoundContent="Kind, namespace or resource not found."
        onDropdownVisibleChange={open => {
          if (open) {
            setImmediate(() => {
              previousInputListFirstChild.current = document.getElementById('quick_search_input_list_0');
            });
          }
        }}
        options={options}
        showAction={['focus']}
        style={{width: '100%'}}
        value={searchingValue}
        onPopupScroll={e => {
          const currentFirstInputListNode = document.getElementById('quick_search_input_list_0');
          // check if the previous first element from the dropdown list is equal to the current first element
          // if not, scroll to the top in order to show the label
          if (
            currentFirstInputListNode &&
            !currentFirstInputListNode.isEqualNode(previousInputListFirstChild.current)
          ) {
            setTimeout(() => (e.target as HTMLDivElement).scrollTo({top: 0, left: 0}), 20);
          }

          previousInputListFirstChild.current = currentFirstInputListNode;
        }}
        onKeyDown={e => {
          if (e.code === 'Escape') {
            e.preventDefault();
            dispatch(closeQuickSearchActionsPopup());
          }
        }}
        onSearch={value => setSearchingValue(value)}
        onSelect={(value: string) => {
          // options are of type : `type:value`
          applyOption(value.split(':')[0], value.split(':')[1]);
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
