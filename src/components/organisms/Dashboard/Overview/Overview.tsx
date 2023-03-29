import {useState} from 'react';

import {K8sClientProvider} from '@src/K8sClientContext';

import {TitleBar} from '@monokle/components';

import {Activity} from './Activity';
import {InventoryInfo} from './InventoryInfo';
import * as S from './Overview.styled';
import {Status} from './Status';
import {Utilization} from './Utilization';

export const Overview = () => {
  const [isActivityPaused, setIsActivityPaused] = useState(false);

  return (
    <K8sClientProvider>
      <S.Container>
        <S.TitleBarContainer style={{gridArea: 'status'}}>
          <TitleBar type="secondary" title="Status" description={<Status />} />
        </S.TitleBarContainer>
        <S.TitleBarContainer style={{gridArea: 'utilization'}}>
          <TitleBar type="secondary" title="Utilization" description={<Utilization />} />
        </S.TitleBarContainer>
        <S.TitleBarContainer style={{gridArea: 'inventory-info'}}>
          <TitleBar type="secondary" title="Inventory & Info" description={<InventoryInfo />} />
        </S.TitleBarContainer>
        <S.TitleBarContainer style={{gridArea: 'activity'}} $disableScroll>
          <TitleBar
            type="secondary"
            title="Activity"
            description={<Activity paused={isActivityPaused} />}
            actions={
              <S.ActionWrapper onClick={() => setIsActivityPaused(!isActivityPaused)}>
                {!isActivityPaused ? <S.PauseCircleFilled /> : <S.PlayCircleFilled />}
                {!isActivityPaused ? <span>Pause</span> : <span>Play</span>}
              </S.ActionWrapper>
            }
          />
        </S.TitleBarContainer>
      </S.Container>
    </K8sClientProvider>
  );
};
