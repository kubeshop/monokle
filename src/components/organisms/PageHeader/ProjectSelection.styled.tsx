import {Button as RawButton, Input as RawInput, Table as RawTable} from 'antd';

import {
  DeleteOutlined as RawDeleteOutlined,
  DownOutlined as RawDownOutlined,
  FolderAddOutlined as RawFolderAddOutlined,
  FolderOpenOutlined as RawFolderOpenOutlined,
  FolderOutlined as RawFolderOutlined,
  FormatPainterOutlined as RawFormatPainterOutlined,
  GithubFilled as RawGithubFilled,
} from '@ant-design/icons';

import styled from 'styled-components';

import {Icon} from '@components/atoms';

import Colors from '@styles/Colors';

export const Button = styled(RawButton)`
  display: flex;
  align-items: center;
  margin-right: 0px;
  padding: 0px;
  width: 100%;

  :hover,
  :focus {
    & span {
      color: ${Colors.lightSeaGreen} !important;
    }
  }
`;

export const GitButtonFilled = styled(RawGithubFilled)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  color: ${Colors.red7};
  margin-left: 8px;
  &:hover {
    opacity: 0.8;
  }
`;

export const DownOutlined = styled(RawDownOutlined)`
  position: absolute !important;
  right: 8px !important;
  color: ${Colors.whitePure};
  font-size: 12px !important;
  padding-top: 1px;
  transition: all 0.2s ease-in;
`;

export const FolderAddOutlined = styled(RawFolderAddOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const FolderOpenOutlined = styled(RawFolderOpenOutlined)`
  font-size: 14px;
  padding-top: 2px;
`;

export const FolderOutlined = styled(RawFolderOutlined)`
  font-size: 15px;
  color: ${Colors.grey9};
  transition: all 0.2s ease-in !important;
`;

export const FormatPainterOutlined = styled(RawFormatPainterOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const GitProjectIcon = styled(Icon)`
  color: ${Colors.grey9};
  transition: all 0.2s ease-in !important;
  padding-top: 2px;
`;

export const GitRepository = styled.div<{$disabled: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({$disabled}) => ($disabled ? 'not-allowed' : 'pointer')};

  & span {
    color: ${({$disabled}) => ($disabled ? Colors.grey6 : Colors.blue6)};
  }
`;

export const GitRepositoryIcon = styled(Icon)`
  color: ${Colors.blue6};
  transition: all 0.2s ease-in !important;
  padding-top: 2px;
  width: 20px;
`;

export const ProjectContainer = styled.div`
  display: flex;
  align-items: center;
  width: 240px;
  background: ${Colors.grey3b};
  padding: 2px 4px;
  border-radius: 4px;
`;

export const ProjectContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;

export const ProjectFolderOpenOutlined = styled(RawFolderOpenOutlined)`
  font-size: 20px;
  color: ${Colors.blue6};
  cursor: pointer;
`;

export const ProjectLabel = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.05em;
  color: ${Colors.grey7};
  width: 60px;
  text-align: left;
  padding: 0px 6px 0px 8px;
`;

export const ProjectMenu = styled.div`
  background-color: ${Colors.grey1000};
  margin: 10px 0;
`;

export const ProjectsMenuActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 120px;
`;

export const ProjectsMenuContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
`;

export const ProjectName = styled.span`
  max-width: 6rem;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: ${Colors.whitePure};
  font-weight: 600;
  font-size: 12px;
  text-align: left;
  transition: all 0.2s ease-in;

  &:disabled {
    color: inherit !important;
  }
`;

export const ProjectTableActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: 4px;
`;

export const Search = styled(RawInput.Search)`
  width: 280px;
`;

export const Table = styled(props => <RawTable {...props} />)`
  width: 800px;
  border-top: 1px solid ${Colors.grey3};
  padding-top: 18px;

  & .ant-table-container .ant-table-body {
    overflow-y: auto !important;
  }
`;

export const TableColumnName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  & span:nth-child(2) {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;
