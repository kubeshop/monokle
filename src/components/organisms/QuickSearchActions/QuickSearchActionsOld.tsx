import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Input, Modal, Select} from 'antd';

import {SearchOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource, updateResourceFilter} from '@redux/reducers/main';
import {closeQuickSearchActionsPopup} from '@redux/reducers/ui';

import {useNamespaces} from '@hooks/useNamespaces';

import Colors from '@styles/Colors';

import {ResourceKindHandlers} from '@src/kindhandlers';

import {LabelTypes, optionsTypes} from './LabelMapper';
import QuickSearchActionsOptionsGroup from './QuickSearchActionsOptionsGroup';

const MainContainer = styled.div`
  padding: 8px 0px;

  & .ant-input-group-addon {
    background: transparent;
  }
`;

const NotFoundLabel = styled.div`
  padding: 12px 20px 4px 20px;
  color: ${Colors.grey7};
`;

const OptionsContainer = styled.div`
  margin-top: 12px;
`;

const InputContainer = styled.div`
  padding: 0 8px;

  & .ant-input-suffix {
    transition: all 0.3s;
    cursor: pointer;
  }

  & .ant-input-affix-wrapper:hover .ant-input-suffix {
    border-color: #165996;
  }

  & .ant-input-affix-wrapper-focused .ant-input-suffix {
    border-left-color: #177ddc;
  }
`;

const StyledInput = styled(Input)`
  padding: 0px 0px 0px 12px;

  & .ant-input-suffix {
    color: ${Colors.grey450};
    font-size: 16px;
    border-left: 1px solid #434343;
    padding: 7px;
  }
`;

const GROUP_OPTIONS_LIMIT = 5;

const KnownResourceKinds = ResourceKindHandlers.map(kindHandler => kindHandler.kind);

const QuickSearchActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const [namespaces] = useNamespaces({extra: ['default']});

  const [filteredOptions, setFilteredOptions] = useState<{namespace: string[]; kind: string[]; resource: string[]}>();
  const [searchingValue, setSearchingValue] = useState<string>('');

  const searchInputRef = useRef<any>();

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

  const foundOptions = useMemo(
    () => (filteredOptions ? Object.values(filteredOptions).some(options => options.length > 0) : false),
    [filteredOptions]
  );

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
    setFilteredOptions(undefined);
    setSearchingValue('');
    dispatch(closeQuickSearchActionsPopup());
  }, [dispatch]);

  // useEffect(() => {
  //   if (!filteredOptions) {
  //     return;
  //   }

  //   const options = Object.entries(filteredOptions).filter(entry => entry[1].length === 1);
  //   console.log(options);

  //   if (options.length !== 1) {
  //     return;
  //   }

  //   const [type, value] = options[0];

  //   const option = type === 'resource' ? resourceMap[value[0]].name : value[0];

  //   document.getElementById(`${option}-0`)?.focus();
  // }, [filteredOptions, resourceMap]);

  const onReturnHandler = useCallback(() => {
    if (!filteredOptions) {
      return;
    }

    const options = Object.entries(filteredOptions).filter(entry => entry[1].length === 1);

    if (options.length !== 1) {
      return;
    }

    const [type, value] = options[0];

    applyOption(type, value[0]);
    closeModalHandler();
  }, [applyOption, closeModalHandler, filteredOptions]);

  useEffect(() => {
    if (!searchingValue && !filteredOptions) {
      return;
    }

    if (!searchingValue && filteredOptions) {
      setFilteredOptions(undefined);
      return;
    }

    const filteredKinds = allResourceKinds
      .filter(kind => kind.toLowerCase().includes(searchingValue.toLowerCase()))
      .slice(0, GROUP_OPTIONS_LIMIT);
    const filteredNamespaces = namespaces
      .filter(ns => ns.toLowerCase().includes(searchingValue.toLowerCase()))
      .slice(0, GROUP_OPTIONS_LIMIT);

    const filteredResources = Object.entries(resourceMap)
      .filter(([, value]) => value.name.toLowerCase().includes(searchingValue.toLowerCase()))
      .map(([key]) => key)
      .slice(0, GROUP_OPTIONS_LIMIT);

    setFilteredOptions({namespace: filteredNamespaces, kind: filteredKinds, resource: filteredResources});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchingValue]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current.focus(), 0);
    }
  }, [isOpen]);

  return (
    <Modal footer={null} bodyStyle={{padding: '0px'}} closable={false} visible={isOpen} onCancel={closeModalHandler}>
      <Select autoFocus showArrow={false} showSearch style={{width: '100%'}}>
        <Select.Option key="test" value="test">
          Test
        </Select.Option>
      </Select>

      <MainContainer>
        <InputContainer>
          <StyledInput
            id="quick-search-input"
            placeholder="Search by namespace, kind and resource"
            ref={searchInputRef}
            suffix={<SearchOutlined />}
            value={searchingValue}
            onChange={e => setSearchingValue(e.target.value)}
            onPressEnter={onReturnHandler}
            onKeyDown={e => {
              if (!filteredOptions || !foundOptions) {
                return;
              }

              if (e.key === 'ArrowDown') {
                e.preventDefault();
                document.getElementById('options-container')?.getElementsByTagName('li')[0].focus();
              }
            }}
          />
        </InputContainer>

        {filteredOptions ? (
          foundOptions ? (
            <OptionsContainer id="options-container">
              {Object.entries(filteredOptions)
                .filter((entry): entry is [LabelTypes, string[]] => optionsTypes.includes(entry[0]))
                .map(([key, value]) => (
                  <QuickSearchActionsOptionsGroup
                    key={key}
                    type={key}
                    options={value}
                    searchingValue={searchingValue.toLowerCase()}
                    onOptionClick={(type, option) => {
                      applyOption(type, option);
                      closeModalHandler();
                    }}
                  />
                ))}
            </OptionsContainer>
          ) : (
            <NotFoundLabel>No namespace, kind or resource found.</NotFoundLabel>
          )
        ) : null}
      </MainContainer>
    </Modal>
  );
};

export default QuickSearchActions;
