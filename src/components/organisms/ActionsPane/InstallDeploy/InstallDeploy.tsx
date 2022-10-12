import {Button, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {useInstallDeploy} from '@hooks/resourceHooks';

interface IProps {
  applySelection: () => void;
}

const InstallDeploy = ({applySelection}: IProps) => {
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);

  const {buttonText, isDisabled, tooltipTitle} = useInstallDeploy();

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltipTitle} placement="bottomLeft">
      <Button
        loading={Boolean(applyingResource)}
        type="primary"
        size="small"
        ghost
        onClick={applySelection}
        disabled={isDisabled}
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
};

export default InstallDeploy;
