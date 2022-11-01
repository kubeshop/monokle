import {Input, Button as RawButton} from 'antd';

import {DeleteOutlined as RawDeleteOutlined, EditOutlined as RawEditOutlined} from '@ant-design/icons';

import styled from 'styled-components';

export const Button = styled(RawButton)`
  margin-top: 10px;
  margin-right: 5px;
  margin-bottom: 10px;
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  margin-left: 5px;
  float: right;
`;

export const EditOutlined = styled(RawEditOutlined)`
  float: right;
`;

export const InputPattern = styled(Input)`
  margin-top: 5px;
`;
