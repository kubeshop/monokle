import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {SecondaryButton} from '@atoms';

import {useInstallDeploy} from '@hooks/resourceHooks';

interface IProps {
  applySelection: () => void;
}

const InstallDeploy = ({applySelection}: IProps) => {
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);

  const {buttonText, isDisabled, tooltipTitle} = useInstallDeploy();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle} placement="bottomLeft">
      <SecondaryButton
        loading={Boolean(applyingResource)}
        type="default"
        size="small"
        onClick={applySelection}
        disabled={isDisabled}
      >
        {buttonText}
      </SecondaryButton>
    </Tooltip>
  );
};

export default InstallDeploy;
