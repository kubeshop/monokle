import React, {useEffect, useMemo, useState} from 'react';

import {Input, Modal} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeQuickSearchActionsPopup} from '@redux/reducers/ui';

import {useNamespaces} from '@hooks/useNamespaces';

import Colors from '@styles/Colors';

import {ResourceKindHandlers} from '@src/kindhandlers';

import {LabelTypes, optionsTypes} from './LabelMapper';
import QuickSearchActionsOptionsGroup from './QuickSearchActionsOptionsGroup';

const {Search} = Input;

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

const GROUP_OPTIONS_LIMIT = 4;

const KnownResourceKinds = ResourceKindHandlers.map(kindHandler => kindHandler.kind);

const QuickSearchActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const [namespaces] = useNamespaces({extra: ['default']});

  const [filteredOptions, setFilteredOptions] = useState<{namespace: string[]; kind: string[]}>();
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

  const foundOptions = useMemo(
    () => (filteredOptions ? Object.values(filteredOptions).some(options => options.length > 0) : false),
    [filteredOptions]
  );

  useEffect(() => {
    if (!searchingValue && !filteredOptions) {
      return;
    }

    if (!searchingValue && filteredOptions) {
      setFilteredOptions(undefined);
      return;
    }

    const filteredKinds = allResourceKinds
      .filter(kind => kind.toLowerCase().startsWith(searchingValue))
      .slice(0, GROUP_OPTIONS_LIMIT);
    const filteredNamespaces = namespaces
      .filter(ns => ns.toLowerCase().startsWith(searchingValue))
      .slice(0, GROUP_OPTIONS_LIMIT);

    setFilteredOptions({namespace: filteredNamespaces, kind: filteredKinds});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchingValue]);

  const onOptionClick = () => {
    setFilteredOptions(undefined);
    setSearchingValue('');
    dispatch(closeQuickSearchActionsPopup());
  };

  return (
    <Modal
      visible={isOpen}
      onCancel={() => dispatch(closeQuickSearchActionsPopup())}
      footer={null}
      closable={false}
      bodyStyle={{padding: '0px'}}
    >
      <MainContainer>
        <Search
          placeholder="Search by namespace, kind and resource"
          style={{padding: '0px 8px'}}
          value={searchingValue}
          onChange={e => setSearchingValue(e.target.value.toLowerCase())}
        />

        {filteredOptions ? (
          foundOptions ? (
            <OptionsContainer>
              {Object.entries(filteredOptions)
                .filter((entry): entry is [LabelTypes, string[]] => optionsTypes.includes(entry[0]))
                .map(([key, value]) => (
                  <QuickSearchActionsOptionsGroup key={key} type={key} options={value} onOptionClick={onOptionClick} />
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
