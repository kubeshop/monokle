import {
  DownOutlined as RawDownOutlined,
  PauseCircleFilled as RawPauseCircleFilled,
  PlayCircleFilled as RawPlayCircleFilled,
} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  padding: 0 16px 16px 16px;
  display: grid;
  height: 100%;
  width: 100%;
  column-gap: 8px;
  row-gap: 8px;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 20% 80%;
  grid-template-areas:
    'status utilization utilization'
    'inventory-info activity activity';
`;

export const TitleBarContainer = styled.div<{$disableScroll?: boolean}>`
  & > div:nth-child(1) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    > div:first-child {
      padding-left: 6px;
    }
  }
  & > div:nth-child(2) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    overflow: ${({$disableScroll}) => ($disableScroll ? 'hidden' : 'auto')};
    padding: ${({$disableScroll}) => ($disableScroll ? '0px' : '9px 10px 6px 10px')};
    margin-top: 4px;
    height: calc(100% - 32px);
    display: flex;
    align-items: center;
  }
`;

export const ActionWrapper = styled.span`
  color: ${Colors.blue7};
  font-weight: 400;
  font-size: 12px;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

export const PauseCircleFilled = styled(RawPauseCircleFilled)`
  color: ${Colors.blue7};
  margin-right: 4px;
`;
export const PlayCircleFilled = styled(RawPlayCircleFilled)`
  color: ${Colors.blue7};
  margin-right: 4px;
`;
export const DownOutlined = styled(RawDownOutlined)`
  color: ${Colors.blue7};
  margin-left: 4px;
`;
