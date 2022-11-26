import {Dropdown, Button as RawButton, Skeleton as RawSkeleton} from 'antd';

import {CloseOutlined as RawCloseOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors, PanelColors} from '@shared/styles/colors';

export const AuthRequiredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  color: ${Colors.grey9};
`;

export const BottomActionsRef = styled.div``;

export const ChangeList = styled.div`
  font-weight: 700;
  color: ${Colors.grey9};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0px 14px 15px 14px;
`;

export const ChangeListStatus = styled.div`
  color: ${Colors.grey7};
  font-weight: 600;
`;

export const CheckboxWrapper = styled.div`
  margin: 0px 14px 15px 14px;
`;

export const CloseOutlined = styled(RawCloseOutlined)`
  background-color: ${Colors.red4};
  color: ${PanelColors.toolBar};
  font-size: 20px;
  border-radius: 50%;
  padding: 8px;
`;

export const DropdownActions = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
`;

export const FileIcon = styled.div`
  margin-left: 12.5px;
  margin-right: 7.5px;
`;

export const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  width: 100%;
`;

export const FileItemData = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: ${Colors.blue10};
`;

export const FileName = styled.span<{$deleted: boolean}>`
  text-decoration: ${({$deleted}) => ($deleted ? 'line-through' : 'none')};
`;

export const FilePath = styled.div`
  color: ${Colors.grey9};
  margin-left: 4px;
  font-weight: normal;
  font-size: 12px;
  line-height: 22px;
`;

export const FileContainer = styled.div<{$height: number}>`
  position: relative;
  ${props => `height: ${props.$height ? `${props.$height}px` : '100%'};`}
  margin-top: 12px;
  overflow-y: auto;
`;

export const FilesAction = styled.div`
  border-top: 1px solid ${Colors.grey3};
  padding-top: 14px;
  padding-left: 14px;
`;

export const GitPaneContainer = styled.div<{$height: number}>`
  ${({$height}) => `
    height: ${$height}px;
  `}

  display: grid;
  grid-template-rows: max-content 1fr max-content;
`;

export const NoChangedFilesLabel = styled.div`
  color: ${Colors.grey9};
  font-weight: 600;
  padding: 20px;
  font-size: 14px;
`;

export const RemoteInputContainer = styled.div``;

export const Skeleton = styled(RawSkeleton)`
  padding: 12px 14px 0px 14px;
`;

export const StagedFilesActionsButton = styled(Dropdown.Button)`
  margin: 5px 0px 22px 14px;

  & button:first-child {
    border-top-left-radius: 4px !important;
    border-bottom-left-radius: 4px !important;
  }

  & button:nth-child(2) {
    border-top-right-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
  }
`;

export const StagedFilesContainer = styled.div`
  margin-bottom: 25px;
`;

export const StageUnstageSelectedButton = styled(RawButton)`
  margin: 5px 0px 0px 14px;
  border-radius: 4px;
`;

export const StagedUnstagedLabel = styled.span`
  font-weight: 700;
  font-size: 12px;
  color: ${Colors.cyan8};
  margin-left: 6px;
`;
