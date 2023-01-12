import {Input, InputProps} from 'antd';

import {SearchOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

const Search = styled(Input)`
  border-radius: 4px;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);

  .anticon-search {
    color: ${Colors.grey6};
    font-size: 16px;
  }

  .ant-input-prefix {
    margin-right: 8px;
  }
`;

const SearchInput: React.FC<InputProps> = props => {
  return <Search prefix={<SearchOutlined />} {...props} />;
};

export default SearchInput;
