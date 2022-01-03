import React from 'react';

import {Modal, Select} from 'antd';

import {SearchOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeQuickSearchActionsPopup} from '@redux/reducers/ui';

const {Option} = Select;

const StyledSelect = styled(Select)`
  width: 100%;

  & .ant-select-arrow {
    font-size: 15px;
    top: 48%;
    width: 15px;
    height: 15px;
  }
`;

const QuickSearchActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.quickSearchActionsPopup.isOpen);

  return (
    <Modal
      visible={isOpen}
      onCancel={() => dispatch(closeQuickSearchActionsPopup())}
      footer={null}
      closable={false}
      bodyStyle={{padding: '0px'}}
    >
      <StyledSelect
        autoFocus
        placeholder="Search by namespace, kind and resource"
        showSearch
        defaultActiveFirstOption={false}
        suffixIcon={<SearchOutlined />}
        dropdownStyle={{borderRadius: '0px'}}
      >
        <Option value="test">Test</Option>
      </StyledSelect>
    </Modal>
  );
};

export default QuickSearchActions;
