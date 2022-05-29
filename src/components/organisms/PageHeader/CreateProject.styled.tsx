import {Button as RawButton} from 'antd';

import styled from 'styled-components';

import FolderSmallPlusWhiteSvg from '@assets/FolderSmallPlusWhite.svg';
import FolderSmallWhiteSvg from '@assets/FolderSmallWhite.svg';
import PlusIconSvg from '@assets/PlusIcon.svg';
import TemplateSmallWhiteSvg from '@assets/TemplateSmallWhite.svg';

import Colors from '@styles/Colors';

export const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  border: none;
  border-radius: 4px;
  height: 28px;
  width: 28px;
  background: ${Colors.grey3b};
  margin-left: 4px;
`;

export const Button = styled(RawButton)`
  display: flex;
  align-items: center;
  padding: 5px;
  width: 100%;

  :hover,
  :focus {
    color: ${Colors.lightSeaGreen};
  }
`;

export const PlusIcon: React.FC = () => {
  return <img src={PlusIconSvg} />;
};

export const FolderSmallWhite: React.FC = () => {
  return <img src={FolderSmallWhiteSvg} />;
};

export const FolderSmallPlusWhite: React.FC = () => {
  return <img src={FolderSmallPlusWhiteSvg} />;
};

export const TemplateSmallWhite: React.FC = () => {
  return <img src={TemplateSmallWhiteSvg} />;
};

export const MenuContainer = styled.div`
  background-color: ${Colors.blue7};
`;

export const MenuItem = styled.div`
  background-color: transparent;
  color: ${Colors.whitePure};
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

export const MenuItemIcon = styled.span`
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const MenuItemLabel = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
`;
