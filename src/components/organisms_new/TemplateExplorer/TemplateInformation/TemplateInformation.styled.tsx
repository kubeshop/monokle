import {Collapse, Descriptions as RawDescriptions} from 'antd';

import {CaretDownOutlined as RawCaretDownOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const CaretDownOutlined = styled(RawCaretDownOutlined)`
  color: ${Colors.blue7};
  font-size: 14px !important;
`;

export const Descriptions = styled(RawDescriptions)`
  .ant-descriptions-item {
    padding-bottom: 6px !important;
  }

  .ant-descriptions-item-label {
    color: ${Colors.grey7};
  }
`;

export const TemplateInformationCollapse = styled(Collapse)`
  border-radius: 4px;
  margin-bottom: 30px;

  .ant-collapse-header {
    background-color: #191f21;
    border-radius: 4px 4px 0px 0px !important;
  }

  .ant-collapse-content {
    background-color: rgba(25, 31, 33, 0.1) !important;
    border-radius: 0px 0px 4px 4px !important;
  }
`;
