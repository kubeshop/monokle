import {Dropdown} from 'antd';

import * as S from './CreateProject.styled';

const menuItems = [
  {
    icon: <S.FolderSmallWhite />,
    label: 'New from local folder',
  },
  {
    icon: <S.FolderSmallPlusWhite />,
    label: 'New from scratch',
  },
  {
    icon: <S.TemplateSmallWhite />,
    label: 'New From template',
  },
];

const itemsMenu = () => {
  return (
    <S.MenuContainer>
      {menuItems.map(item => (
        <S.MenuItem key={item.label}>
          <S.MenuItemIcon>{item.icon}</S.MenuItemIcon>
          <S.MenuItemLabel>{item.label}</S.MenuItemLabel>
        </S.MenuItem>
      ))}
    </S.MenuContainer>
  );
};

const CreateProject = () => {
  return (
    <S.DropdownContainer>
      <Dropdown overlay={itemsMenu} placement="bottomLeft" trigger={['click']}>
        <S.Button type="link" size="small">
          <S.PlusIcon />
        </S.Button>
      </Dropdown>
    </S.DropdownContainer>
  );
};

export default CreateProject;
