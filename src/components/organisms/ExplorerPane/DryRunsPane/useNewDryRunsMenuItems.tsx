import {useMemo} from 'react';

import {MenuProps} from 'antd';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';
import {openSaveEditCommandModal} from '@redux/reducers/ui';

import {Colors} from '@monokle/components';

export function useNewDryRunsMenuItems() {
  const dispatch = useAppDispatch();

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'from-scratch',
        label: <MenuItem>Dry run Configuration</MenuItem>,
        onClick: () => {
          dispatch(openPreviewConfigurationEditor({}));
        },
      },
      {
        key: 'from-template',
        label: <MenuItem>Command Dry run</MenuItem>,
        onClick: () => {
          dispatch(openSaveEditCommandModal({}));
        },
      },
    ],
    [dispatch]
  );

  return items;
}

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${Colors.whitePure};
  font-weight: 700;
  height: 30px;
  font-size: 12px;
`;
