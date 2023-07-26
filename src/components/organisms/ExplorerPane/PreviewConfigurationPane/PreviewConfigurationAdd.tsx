import {Button, Tooltip} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NewPreviewConfigurationTooltip} from '@constants/tooltips';

import {useAppDispatch} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';

const PreviewConfigurationAdd: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NewPreviewConfigurationTooltip}>
      <AddButton
        type="primary"
        ghost
        size="small"
        icon={<PlusOutlined />}
        onClick={() => {
          dispatch(openPreviewConfigurationEditor({}));
        }}
      >
        Create dry-run configuration
      </AddButton>
    </Tooltip>
  );
};

export default PreviewConfigurationAdd;

// Styled Components

const AddButton = styled(Button)`
  border-radius: 4px;
  font-size: 13px;
  padding-left: 11px;
`;
