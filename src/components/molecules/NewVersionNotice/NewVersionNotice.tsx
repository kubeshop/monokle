import {Tooltip} from 'antd';

import {CloseOutlined as RawCloseOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {hideNewVersionNotice} from '@redux/reducers/ui';

import {Colors} from '@shared/styles/colors';

type IProps = {
  children: React.ReactNode;
};

const NewVersionNotice: React.FC<IProps> = ({children}) => {
  const dispatch = useAppDispatch();
  const isNewVersionNoticeVisible = useAppSelector(state => state.ui.newVersionNotice.isVisible);

  return (
    <Tooltip
      overlayClassName="new-version-notice-tooltip"
      open={isNewVersionNoticeVisible}
      title={
        <TitleContainer>
          <div>
            A new version is available.<RestartButton> Restart</RestartButton> to enjoy.
          </div>

          <CloseOutlined onClick={() => dispatch(hideNewVersionNotice())} />
        </TitleContainer>
      }
      placement="right"
    >
      {children}
    </Tooltip>
  );
};

export default NewVersionNotice;

// Styled Components

const CloseOutlined = styled(RawCloseOutlined)`
  color: ${Colors.grey8};
  cursor: pointer;
`;

const RestartButton = styled.span`
  font-weight: 700;
  cursor: pointer;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
