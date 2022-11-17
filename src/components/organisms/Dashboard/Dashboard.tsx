import {useAppSelector} from '@redux/hooks';

import PodHandler from '@src/kindhandlers/Pod.handler';

import * as S from './Dashboard.styled';
import {Overview} from './Overview/Overview';
import {CellAge, CellName, CellNamespace, CellNode, CellStatus} from './Tableview/TableCells';
import {Tableview} from './Tableview/Tableview';

export const Dashboard = () => {
  const activeMenu = useAppSelector(state => state.ui.dashboard.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const filterResourcesByKind = (kind: string) => {
    return Object.values(resourceMap).filter(resource => resource.kind === kind);
  };

  return (
    <S.Container>
      <S.Header title={activeMenu} />
      <S.Content>
        {activeMenu === 'Overview' && <Overview />}
        {activeMenu !== 'Overview' && (
          <Tableview
            dataSource={filterResourcesByKind(activeMenu)}
            columns={resourceKindColumns[activeMenu] || [CellName, CellNamespace, CellAge]}
          />
        )}
      </S.Content>
    </S.Container>
  );
};

export const resourceKindColumns = {
  [PodHandler.kind]: [CellStatus, CellName, CellNamespace, CellNode, CellAge],
};
