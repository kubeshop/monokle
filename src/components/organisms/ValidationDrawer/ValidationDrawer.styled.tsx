import styled from 'styled-components';

import BaseDrawer, {DrawerProps as BaseDrawerProps} from '@components/atoms/Drawer';

type DrawerProps = BaseDrawerProps & {
  height: number;
};

export const Drawer = styled((props: DrawerProps) => <BaseDrawer {...props} />)`
  position: absolute;
  height: ${props => props.height};
  overflow: hidden;

  .ant-drawer-wrapper-body {
    background-color: #191f21;
  }

  .ant-drawer-header {
    background-color: #191f21;
    padding-left: 16px;
    padding-top: 8px;
    padding-right: 4px;
    padding-bottom: 8px;
  }
`;

export const ValidationImg = styled.img`
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 120px;
`;

export const ValidationTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: 0em;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 32px;
`;
