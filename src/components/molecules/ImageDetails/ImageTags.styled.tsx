import {Input, Pagination as RawPagination, Tag as RawTag} from 'antd';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const ImageTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const NotFoundLabel = styled.span`
  color: ${Colors.grey7};
`;

export const Pagination = styled(RawPagination)`
  margin-top: 20px;
`;

export const SearchInput = styled(Input.Search)`
  margin-bottom: 25px;
  max-width: 300px;
`;

export const Tag = styled(RawTag)`
  color: rgba(255, 255, 255, 0.72);
  background-color: ${Colors.geekblue4};
  border: none;
  border-radius: 2px;
  font-size: 14px;
  padding: 2px 5px;
  cursor: pointer;
  margin-bottom: 10px;

  &:hover {
    background: ${Colors.cyan5};
  }
`;
