import {Menu as RawMenu} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Menu = styled(RawMenu)`
  background: ${Colors.blue7};
  padding: 0px;

  & li {
    border-bottom: 1px solid ${Colors.grey5b};

    &:last-child {
      border-bottom: none;
    }
  }
`;
