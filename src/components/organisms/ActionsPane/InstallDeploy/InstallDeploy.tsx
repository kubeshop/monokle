import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {PrimaryButton} from '@atoms';

import {useInstallDeploy} from '@hooks/resourceHooks';

type IProps = {
  applySelection: () => void;
  isDropdownActive?: boolean;
};

const InstallDeploy: React.FC<IProps> = props => {
  const {applySelection, isDropdownActive = false} = props;

  const applyingResource = useAppSelector(state => state.main.isApplyingResource);

  const {buttonText, isDisabled, tooltipTitle} = useInstallDeploy();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle} placement="bottomLeft">
      <PrimaryButton
        loading={Boolean(applyingResource)}
        type={isDropdownActive ? 'link' : 'default'}
        size="small"
        onClick={applySelection}
        disabled={isDisabled}
      >
        {buttonText}
      </PrimaryButton>
    </Tooltip>
  );
};

export default InstallDeploy;
