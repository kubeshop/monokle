import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ScaleTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openScaleModal} from '@redux/reducers/ui';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';

import {PrimaryButton} from '@atoms';

import {isInClusterModeSelector} from '@shared/utils/selectors';

const Scale: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentResource = useSelectedResource();
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const isBtnEnabled = useMemo(
    () => currentResource && currentResource.kind === 'Deployment' && isInClusterMode,
    [currentResource, isInClusterMode]
  );

  return (
    <>
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ScaleTooltip} placement="bottomLeft">
        <PrimaryButton
          type="link"
          size="small"
          onClick={() => {
            if (!currentResource) {
              return;
            }

            dispatch(openScaleModal(currentResource));
          }}
          disabled={!isBtnEnabled}
        >
          Scale
        </PrimaryButton>
      </Tooltip>
    </>
  );
};

export default Scale;
