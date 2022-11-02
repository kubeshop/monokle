import {Button, Skeleton as RawSkeleton, Tree} from 'antd';

import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import Colors, {FontColors} from '@styles/Colors';

export const NavigatorPaneContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
export const ContextMenuDivider = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
`;

export const FilePathLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const NoFilesContainer = styled.div`
  margin-left: 16px;
  margin-top: 10px;
`;

export const NodeContainer = styled.div`
  position: relative;
`;

export const NodeTitleContainer = styled.div`
  padding-right: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NumberOfResources = styled.span`
  margin-left: 12px;
  color: ${Colors.grey7};
`;

export const RootFolderText = styled.div`
  font-size: 12px;
  line-height: 22px;
  color: ${Colors.grey7};
  margin-top: 10px;
  margin-left: 14px;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const SpinnerWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;

  @supports (backdrop-filter: blur(10px)) or (--webkit-backdrop-filter: blur(10px)) {
    backdrop-filter: blur(5px);
    --webkit-backdrop-filter: blur(5px);
  }
`;

export const Title = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
`;

export const TitleBarContainer = styled.div`
  border-bottom: ${AppBorders.sectionDivider};
`;

export const TreeContainer = styled.div`
  margin-left: 2px;
`;

export const TreeDirectoryTree = styled(Tree.DirectoryTree)`
  margin-top: 10px;
  .ant-tree-switcher svg {
    color: ${props => (props.disabled ? `${Colors.grey800}` : 'inherit')} !important;
  }

  opacity: ${props => (props.disabled ? '70%' : '100%')};
`;

export const TreeTitleText = styled.span`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

export const TreeTitleWrapper = styled.div<{$isDisabled: boolean}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({$isDisabled}) => ($isDisabled ? 'default' : 'inherit')};

  height: 100%;

  & .ant-dropdown-trigger {
    height: inherit;
    margin-right: 10px;
  }
`;

export const PreviewButton = styled(Button)<{$isItemSelected: boolean}>`
  font-weight: 500;
  font-size: 12px;
  color: ${props => (props.$isItemSelected ? Colors.blackPure : Colors.blue6)}!important;
  margin-left: 5px;
  margin-right: 15px;
`;

export const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 80%;
`;

export const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: row;
  height: 100%;
`;
