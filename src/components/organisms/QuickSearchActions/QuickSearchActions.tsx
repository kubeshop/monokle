import React, {useMemo, useState} from 'react';

import {Input, Modal} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeQuickSearchActionsPopup} from '@redux/reducers/ui';

import {useNamespaces} from '@hooks/useNamespaces';

import Colors from '@styles/Colors';

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

const QuickSearchActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);

  const [namespaces] = useNamespaces({extra: ['default']});

  const [filteredOptions, setFilteredOptions] = useState<{namespace: string[]; kind: string[]}>();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchedValue = e.target.value;

    if (!searchedValue) {
      setFilteredOptions(undefined);
      return;
    }

    const filteredNamespaces = namespaces.filter(ns => ns.startsWith(e.target.value));

    setFilteredOptions({namespace: filteredNamespaces, kind: []});
  };

  const foundOptions = useMemo(
    () => (filteredOptions ? Object.values(filteredOptions).some(options => options.length > 0) : false),
    [filteredOptions]
  );

  return (
    <Modal
      visible={isOpen}
      onCancel={() => dispatch(closeQuickSearchActionsPopup())}
      footer={null}
      closable={false}
      bodyStyle={{padding: '0px'}}
    >
      <MainContainer>
        <Search placeholder="Search by namespace, kind and resource" onChange={onChange} style={{padding: '0px 8px'}} />

        {filteredOptions ? (
          foundOptions ? (
            <OptionsContainer>
              {Object.entries(filteredOptions)
                .filter((entry): entry is [LabelTypes, string[]] => optionsTypes.includes(entry[0]))
                .map(([key, value]) => (
                  <QuickSearchActionsOptionsGroup key={key} type={key} options={value} />
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
