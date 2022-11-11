import {Button as RawButton} from 'antd';

import {
  ApiOutlined as RawApiOutlined,
  CommentOutlined as RawCommentOutlined,
  QuestionCircleOutlined as RawQuestionCircleOutlined,
  SettingOutlined as RawSettingOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles/colors';

export const ApiOutlined = styled(RawApiOutlined)`
  font-size: 14px;
  cursor: pointer;
`;

export const CommentOutlined = styled(RawCommentOutlined)`
  font-size: 14px;
  cursor: pointer;
`;

export const HelpLink = styled(RawButton)`
  color: ${Colors.grey9};
`;

export const MenuContainer = styled.div`
  background-color: ${Colors.grey4000};
`;

export const MenuItem = styled.div`
  background-color: transparent;
  color: ${Colors.grey9};
  font-weight: 700;
  font-size: 14px;
  border-bottom: 1px solid ${Colors.grey5b};

  &:last-child {
    border-bottom: none;
  }
  height: 40px;
  display: flex;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export const MenuItemLabel = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
`;

export const MenuItemLinks = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding-left: 40px;
  padding-bottom: 0.5rem;
  margin-top: -0.5rem;
  border-bottom: 1px solid ${Colors.grey5b};
`;

export const MenuItemIcon = styled.span`
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const QuestionCircleOutlined = styled(RawQuestionCircleOutlined)`
  cursor: pointer;
  font-size: 14px;
`;

export const SettingsOutlined = styled(RawSettingOutlined)`
  font-size: 14px;
  cursor: pointer;
`;
