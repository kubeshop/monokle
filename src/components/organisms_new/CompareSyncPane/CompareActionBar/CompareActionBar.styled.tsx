import {AutoComplete as RawAutoComplete, Checkbox as RawCheckbox, Input as RawInput, Select as RawSelect} from 'antd';

import {SearchOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const ActionBarDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  color: ${Colors.grey6};

  .ant-select-selector {
    border-color: ${Colors.grey7} !important;
  }

  input {
    color: ${Colors.whitePure};
  }
`;

export const ActionBarRightDiv = styled.div`
  display: flex;
  align-items: center;
`;

export const Checkbox = styled(RawCheckbox)`
  color: ${Colors.grey8};

  .ant-checkbox-inner {
    border-color: ${Colors.grey7};
    margin-right: 5px;
  }
`;

export const NamespaceInput = styled(RawAutoComplete)`
  width: 175px;

  .ant-select-selection-placeholder {
    color: ${Colors.grey8};
  }
`;

export const SearchIcon = styled(SearchOutlined)`
  color: ${Colors.grey7};
`;

export const SearchInput = styled(RawInput)`
  border-color: ${Colors.grey7};
  color: ${Colors.grey9};

  .ant-input-prefix .anticon {
    color: ${Colors.grey9};
  }

  input::placeholder {
    color: ${Colors.grey8};
  }
`;

export const Select = styled(RawSelect)`
  .ant-select-selection-item {
    color: ${Colors.whitePure};
  }
`;
