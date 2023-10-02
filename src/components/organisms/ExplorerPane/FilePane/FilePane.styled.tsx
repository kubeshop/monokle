import {Skeleton as RawSkeleton} from 'antd';

import styled from 'styled-components';

import {Colors, FontColors} from '@shared/styles/colors';

export const FileTreeContainer = styled.div`
  width: 100%;
  height: 100%;

  & .ant-tree {
    font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', -apple-system, BlinkMacSystemFont;
    font-variant: tabular-nums;
    font-size: 12px;
    font-style: normal;
    font-weight: normal;
    line-height: 22px;
    color: ${FontColors.darkThemeMainFont};
  }
  & .ant-tree-list-scrollbar {
    width: 8px;
    background: ${Colors.grey1000};
    border-radius: 0;
  }

  & .ant-tree-list-scrollbar-thumb {
    background: ${Colors.grey4} !important;
    border-radius: 0 !important;
  }

  & .ant-tree-treenode-not-supported:hover::before {
    background: transparent !important;
  }

  & .ant-tree-switcher-leaf-line::before {
    border-right: 1px solid #434343;
  }

  & .ant-tree-switcher-leaf-line::after {
    border-bottom: 1px solid #434343;
  }

  & .ant-tree-node-content-wrapper {
    display: flex;
    overflow: hidden;
  }

  & .ant-tree-node-content-wrapper .ant-tree-title {
    overflow: hidden;
    flex-grow: 1;
  }

  & .ant-tree-switcher {
    background: transparent;
  }

  & .excluded-file-entry-name {
    color: ${Colors.grey800};
    font-style: italic;
  }

  & .not-supported-file-entry-name {
    color: ${Colors.grey800};
  }
`;

export const NoFilesContainer = styled.div`
  margin-left: 16px;
  margin-top: 10px;
`;

export const RootFolderText = styled.div`
  font-size: 10px;
  color: ${Colors.geekblue8};
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const TitleBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .ant-btn-icon-only.ant-btn-sm {
    width: 20px;
    height: 20px;
  }

  .anticon {
    color: ${Colors.whitePure};
    font-size: 16px;
  }
`;

export const Container = styled.div`
  position: relative;
  height: 100%;
`;

export const TitleBarContainer = styled.div`
  padding: 16px 24px 0px 16px;
`;
