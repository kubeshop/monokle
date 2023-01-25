import {useMemo} from 'react';

import {MenuProps} from 'antd';

import {FolderAddOutlined as RawFolderAddOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';

import TemplateSmallWhiteSvg from '@assets/TemplateSmallWhite.svg';

import {Colors} from '@shared/styles/colors';

export function useNewResourceMenuItems() {
  const dispatch = useAppDispatch();

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'from-scratch',
        label: (
          <MenuItem>
            <FolderAddOutlined />
            New from scratch
          </MenuItem>
        ),

        onClick: () => dispatch(openNewResourceWizard()),
      },
      {
        key: 'from-template',
        label: (
          <MenuItem>
            <img src={TemplateSmallWhiteSvg} />
            New from template
          </MenuItem>
        ),
      },
    ],
    [dispatch]
  );

  return items;
}

// Styled Components

const FolderAddOutlined = styled(RawFolderAddOutlined)`
  font-size: 16px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${Colors.whitePure};
  font-weight: 700;
  height: 30px;
`;
