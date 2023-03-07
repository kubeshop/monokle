import {Collapse, Modal as RawModal} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const EmptyContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  margin-left: 50px;
  margin-top: 30px;
`;

export const EmptyImage = styled.img`
  width: 150px;
  max-width: 150px;
`;

export const EmptyText = styled.div`
  font-weight: 600;
  color: ${Colors.grey9};
  max-width: 160px;
  margin-top: 30px;
`;

export const LeftContainer = styled.div`
  background-color: #1d1d1d;
  overflow-y: hidden;
`;

export const Modal = styled(RawModal)`
  height: 87%;
  padding-bottom: 0;
  top: 60px;

  .ant-modal-content {
    height: 100%;
  }

  .ant-modal-header,
  .ant-modal-body {
    background-color: #131515;
  }

  .ant-modal-body {
    padding: 0px;
    display: grid;
    grid-template-columns: 2fr 3fr;
    grid-template-rows: 1fr;
    height: 100%;
  }
`;

export const NoTemplatesMessage = styled.div`
  color: ${Colors.grey9};
  padding: 16px;
  font-weight: 700;
`;

export const PaddingWrapper = styled.div`
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const RightContainer = styled.div`
  padding: 25px;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
`;

export const TemplatesCollapse = styled(Collapse)<{$topHeight: number}>`
  max-height: ${({$topHeight}) => `calc(100% - ${$topHeight + 50}px)`};
  overflow-y: auto;

  .ant-collapse-header {
    padding-left: 25px !important;
  }

  .ant-collapse-item:last-child {
    padding-bottom: 10px;
  }

  .ant-collapse-content-box {
    padding: 0 !important;
  }
`;
