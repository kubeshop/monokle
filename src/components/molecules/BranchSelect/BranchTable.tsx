import {useMemo, useState} from 'react';

import {SearchOutlined} from '@ant-design/icons';

import {GitBranch} from '@models/git';

import {useAppSelector} from '@redux/hooks';

import * as S from './BranchTable.styled';
import {useBranchTable} from './useBranchTable';

type IProps = {
  onSelect: (branch: GitBranch) => void;
};

const BranchTable: React.FC<IProps> = ({onSelect}) => {
  const branchMap = useAppSelector(state => state.git.repo?.branchMap);

  const [searchFilter, setSearchFilter] = useState<string>('');

  const searchedBranches: GitBranch[] = useMemo(() => {
    if (!branchMap) {
      return [];
    }

    return Object.values(branchMap).filter(branch => {
      return branch.name.toLowerCase().includes(searchFilter.toLowerCase());
    });
  }, [branchMap, searchFilter]);

  const columns = useBranchTable({
    branchCount: searchedBranches.length,
    onSelect,
  });

  return (
    <S.Container>
      <S.TableFilter>
        <S.SearchInput
          prefix={<SearchOutlined />}
          value={searchFilter}
          onChange={event => setSearchFilter(event.target.value)}
        />
      </S.TableFilter>

      <S.Table
        rowKey="name"
        columns={columns}
        dataSource={searchedBranches}
        showSorterTooltip={false}
        pagination={false}
        size="small"
        scroll={{y: 350}}
      />
    </S.Container>
  );
};

export default BranchTable;
