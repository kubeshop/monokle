import {Input} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const HelperLabel = styled.div`
  opacity: 0.5;
`;

export const ImagesCount = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

export const NameDisplayContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  padding: 16px 26px;
  font-size: 12px;
  color: ${Colors.grey9};

  &:hover {
    background-color: transparent;
  }
`;

export const SearchInput = styled(Input.Search)`
  & input::placeholder {
    color: ${Colors.grey7};
  }
`;
