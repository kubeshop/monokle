import {useState} from 'react';

import {SearchOutlined} from '@ant-design/icons';

import {GitBranch} from '@models/git';

import * as S from './BranchTable.styled';
import {useBranchTable} from './useBranchTable';

type Props = {
  branches: GitBranch[];
  branchCount: number;
  onSelect: (branch: GitBranch) => void;
};

function BranchTable({branches, branchCount, onSelect}: Props) {
  const [searchFilter, setSearchFilter] = useState<string>('');

  const searchedBranches: GitBranch[] = branches.filter(branch => {
    return branch.name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const columns = useBranchTable({
    branchCount,
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
        scroll={{y: 320}}
        locale={{emptyText: ' '}}
      />
    </S.Container>
  );
}

export default BranchTable;
