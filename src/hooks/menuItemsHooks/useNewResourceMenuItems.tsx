import {useMemo} from 'react';

import {MenuProps} from 'antd';

import {FileAddOutlined as RawFileAddOutlined, RobotOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {openNewAiResourceWizard, openNewResourceWizard, openTemplateExplorer} from '@redux/reducers/ui';

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
            <FileAddOutlined />
            New from model
          </MenuItem>
        ),
        onClick: () => dispatch(openNewResourceWizard()),
      },
      {
        key: 'from-ai',
        label: (
          <MenuItem>
            <RobotOutlined />
            New from AI generated
          </MenuItem>
        ),
        onClick: () => dispatch(openNewAiResourceWizard()),
      },
      {
        key: 'from-template',
        label: (
          <MenuItem>
            <img src={TemplateSmallWhiteSvg} />
            New from advanced template
          </MenuItem>
        ),
        onClick: () => dispatch(openTemplateExplorer()),
      },
    ],
    [dispatch]
  );

  return items;
}

// Styled Components

const FileAddOutlined = styled(RawFileAddOutlined)`
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
