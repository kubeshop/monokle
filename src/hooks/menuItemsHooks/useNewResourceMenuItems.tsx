import {useMemo} from 'react';

import {MenuProps} from 'antd';

import {FileAddOutlined as RawFileAddOutlined, RobotOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {openNewAiResourceWizard, openNewResourceWizard, openTemplateExplorer} from '@redux/reducers/ui';

import TemplateSmallWhiteSvg from '@assets/TemplateSmallWhite.svg';

import {Colors} from '@shared/styles/colors';
import {trackEvent} from '@shared/utils/telemetry';

export function useNewResourceMenuItems() {
  const dispatch = useAppDispatch();

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'from-scratch',
        label: (
          <MenuItem>
            <FileAddOutlined />
            use Basic Form
          </MenuItem>
        ),
        onClick: () => {
          trackEvent('new_resource/create', {type: 'wizard', from: 'navigator_header'});
          dispatch(openNewResourceWizard());
        },
      },
      {
        key: 'from-template',
        label: (
          <MenuItem>
            <img src={TemplateSmallWhiteSvg} />
            use Advanced Template
          </MenuItem>
        ),
        onClick: () => {
          trackEvent('new_resource/create', {type: 'advanced_template', from: 'navigator_header'});
          dispatch(openTemplateExplorer());
        },
      },
      {
        key: 'from-ai',
        label: (
          <MenuItem>
            <RobotOutlined />
            use AI Assistant
          </MenuItem>
        ),
        onClick: () => {
          trackEvent('new_resource/create', {type: 'AI', from: 'navigator_header'});
          dispatch(openNewAiResourceWizard());
        },
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
