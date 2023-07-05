import {Select as RawSelect} from 'antd';

import styled from 'styled-components';

import {IconButton} from '@atoms';

import {BackgroundColors, Colors} from '@shared/styles/colors';

export const EmptyList = styled.div`
  display: flex;
  align-items: center;
  color: ${Colors.grey7};
  gap: 5px;
`;

export const NewProjectIcon = styled(IconButton)`
  height: 24px;
  padding: 3px 6px 2px 6px;
  display: inline-block;
  margin-right: 3px;
  cursor: default;

  &:hover {
    color: ${Colors.whitePure} !important;
  }
`;

export const ProjectsListContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-right: 10px;
  overflow-y: auto;
  width: 100%;
`;

export const Select = styled(RawSelect)`
  & .ant-select-selection-item,
  & .ant-select-arrow {
    color: ${Colors.grey9} !important;
  }

  & .ant-select-selector {
    border: none !important;
    box-shadow: none !important;
  }
`;

export const SortAndFiltersContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const SearchInput = styled.input`
  border: none;
  outline: none;
  background-color: ${BackgroundColors.darkThemeBackground};
  font-size: 14px;
  margin-left: 5px;
`;

export const SearchInputBar = styled.div`
  border: 1px solid ${Colors.grey10};
  border-radius: 3px;
  padding: 5px 10px;
  outline: none;
  width: 300px;
  background-color: ${BackgroundColors.darkThemeBackground};
  font-size: 14px;
  display: flex;
  align-items: center;
`;

export const SortFilterAndSearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 99%;
`;

export const NoProjectsFoundContainer = styled.div`
  color: ${Colors.grey7};
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ThunderIcon = styled.img`
  height: 15px;
  width: 15px;
`;
