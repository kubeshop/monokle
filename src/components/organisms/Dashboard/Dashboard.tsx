import {TitleBar} from '@monokle/components';

import * as S from './Dashboard.styled';

export const Dashboard = () => {
  return (
    <S.Container>
      <S.OverviewContainer style={{gridArea: 'overview'}}>
        <TitleBar type="secondary" title="Overview" actions={<span>Selection</span>} />
      </S.OverviewContainer>
      <S.TitleBarContainer style={{gridArea: 'status'}}>
        <TitleBar type="secondary" title="Status" description={<p>Status</p>} />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'performance'}}>
        <TitleBar
          type="secondary"
          title="Performance"
          actions={<span>CPU Graph</span>}
          description={<p>Performance</p>}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'utilization'}}>
        <TitleBar
          type="secondary"
          title="Utilization"
          actions={<span>Default view</span>}
          description={<p>Utilization</p>}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'inventory-info'}}>
        <TitleBar
          type="secondary"
          title="Inventory & Info"
          actions={<span>See all</span>}
          description={<p>See all</p>}
        />
      </S.TitleBarContainer>
      <S.TitleBarContainer style={{gridArea: 'activity'}}>
        <TitleBar
          type="secondary"
          title="Activity"
          actions={<span>Pause See all</span>}
          description={<p>Pause See all</p>}
        />
      </S.TitleBarContainer>
    </S.Container>
  );
};
