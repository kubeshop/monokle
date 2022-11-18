import {useAppSelector} from '@redux/hooks';

import EndpointSliceHandler from '@src/kindhandlers/EndpointSlice.handler';
import PodHandler from '@src/kindhandlers/Pod.handler';

import {CellAge, CellError, CellName, CellNamespace, CellNode, CellStatus} from '../Tableview/TableCells';
import {Tableview} from '../Tableview/Tableview';
import * as S from './Dashboard.styled';
import {Overview} from './Overview';

export const Dashboard = () => {
  const activeMenu = useAppSelector(state => state.ui.dashboard.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.ui.dashboard.selectedNamespace);

  const filterResources = (kind: string) => {
    return Object.values(resourceMap).filter(
      resource =>
        resource.kind === kind && (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true)
    );
  };

  return (
    <S.Container>
      <S.Header title={activeMenu} />
      <S.Content>
        {activeMenu === 'Overview' && <Overview />}
        {activeMenu !== 'Overview' && (
          <Tableview
            dataSource={filterResources(activeMenu)}
            columns={resourceKindColumns[activeMenu] || [CellName, CellError, CellNamespace, CellAge]}
          />
        )}
      </S.Content>
    </S.Container>
  );
};

export const resourceKindColumns = {
  [PodHandler.kind]: [CellStatus, CellName, CellNamespace, CellNode, CellAge],
  [EndpointSliceHandler.kind]: [CellName, CellError, CellNamespace, CellAge],
};
