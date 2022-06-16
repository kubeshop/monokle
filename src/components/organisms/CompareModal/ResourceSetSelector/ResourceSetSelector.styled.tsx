import styled from 'styled-components';

export const ResourceSetSelectorDiv = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 2;
  background-color: #31393c;
  margin-bottom: 16px;
`;

export const SelectSpacer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  flex-grow: 1;
  min-width: auto;
  overflow: hidden;
  align-items: center;

  .ant-select-selection-item {
    text-overflow: ellipsis;
  }
`;

export const KustomizeSelectContainer = styled.div`
  max-width: 320;
  min-width: 0;
  width: 100%;
`;

export const ActionsDiv = styled.div`
  flex: 0 0 auto;
`;
