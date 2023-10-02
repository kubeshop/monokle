import {Tooltip} from 'antd';

import {CloseCircleFilled, ReloadOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {previewLabelSelector} from '@redux/selectors';
import {restartPreview, stopPreview} from '@redux/thunks/preview';

import {TitleBarWrapper} from '@components/atoms';

import {Icon, TitleBar} from '@monokle/components';
import {Colors} from '@shared/styles';

import NavigatorDescription from './NavigatorDescription';

const DryRunTitleBar = () => {
  const dispatch = useAppDispatch();
  const preview = useAppSelector(state => state.main.preview);
  const previewLabel = useAppSelector(previewLabelSelector);

  return (
    <TitleBarWrapper $navigator>
      <TitleBar
        type="secondary"
        title={
          <div style={{color: Colors.blackPure}}>
            <Icon style={{width: 20, height: 20}} name={preview?.type === 'kustomize' ? 'kustomize' : 'helm'} />
            <Label>{previewLabel}</Label>
            <Tooltip title="Reload Dry-run" mouseEnterDelay={TOOLTIP_DELAY}>
              <ReloadIcon onClick={() => preview && dispatch(restartPreview(preview))} />
            </Tooltip>
            <Tooltip title="Exit Dry-run" mouseEnterDelay={TOOLTIP_DELAY}>
              <CloseCircleFilled onClick={() => dispatch(stopPreview())} />
            </Tooltip>
          </div>
        }
        description={<NavigatorDescription />}
        headerStyle={{background: Colors.dryRun}}
        descriptionStyle={{
          background: `${Colors.dryRun}20`,
          paddingTop: '5px',
        }}
      />
    </TitleBarWrapper>
  );
};

export default DryRunTitleBar;

const Label = styled.span`
  margin-right: 8px;
`;

const ReloadIcon = styled(ReloadOutlined)`
  margin-right: 8px;
`;
