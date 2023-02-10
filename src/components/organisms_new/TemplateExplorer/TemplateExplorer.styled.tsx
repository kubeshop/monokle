import {Collapse, Modal as RawModal} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const EmptyImage = styled.img`
  margin-left: 50px;
`;

export const EmptyText = styled.div`
  display: inline-block;
  font-weight: 600;
  color: ${Colors.grey9};
  max-width: 160px;
  transform: translateY(25px);
  margin-left: 15px;
  margin-top: 50px;
`;

export const LeftContainer = styled.div`
  background-color: #1d1d1d;
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
`;

export const TemplatesCollapse = styled(Collapse)`
  max-height: calc(100% - 200px);
  overflow-y: auto;

  .ant-collapse-header {
    padding-left: 25px !important;
  }

  .ant-collapse-item:last-child {
    margin-bottom: 25px;
  }

  .ant-collapse-content-box {
    padding: 0 !important;
  }
`;
