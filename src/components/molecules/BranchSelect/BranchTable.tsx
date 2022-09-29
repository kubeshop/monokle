import {useMemo, useState} from 'react';

import {PlusCircleFilled, SearchOutlined} from '@ant-design/icons';

import {GitBranch} from '@models/git';

import {useAppSelector} from '@redux/hooks';

import * as S from './BranchTable.styled';
import CreateBranchInput from './CreateBranchInput';
import {useBranchTable} from './useBranchTable';

const {Option} = S.Select;

type IProps = {
  onSelect: (branch: GitBranch) => void;
};

const BranchTable: React.FC<IProps> = ({onSelect}) => {
  const branchMap = useAppSelector(state => state.git.repo?.branchMap);

  const [branchType, setBranchType] = useState<string>('all');
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredBranches = useMemo(() => {
    if (!branchMap) {
      return [];
    }

    let branches = Object.values(branchMap);

    if (branchType !== 'all') {
      branches = branches.filter(branch => branch.type === branchType);
    }

    return branches.filter(branch => branch.name.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [branchMap, branchType, searchFilter]);

  const columns = useBranchTable({branchCount: filteredBranches.length});

  return (
    <S.Container>
      <S.TableFilter>
        <S.Select value={branchType} onChange={value => setBranchType(value as string)}>
          <Option key="local_remote" value="all">
            Local & Remote
          </Option>
          <Option key="local" value="local">
            Only local
          </Option>
          <Option key="remote" value="remote">
            Only remote
          </Option>
        </S.Select>

        <S.SearchInput
          prefix={<SearchOutlined />}
          value={searchFilter}
          onChange={event => setSearchFilter(event.target.value)}
        />
      </S.TableFilter>

      <S.Table
        onRow={branch => ({
          onClick: () => {
            onSelect(branch);
          },
        })}
        rowKey="name"
        columns={columns}
        dataSource={filteredBranches}
        showSorterTooltip={false}
        pagination={false}
        size="small"
        scroll={{y: 350}}
      />

      <S.CreateBranchButton type="link" icon={<PlusCircleFilled />} onClick={() => setCreatingBranch(true)}>
        Create new branch
      </S.CreateBranchButton>

      {creatingBranch ? <CreateBranchInput hideCreateBranchInputHandler={() => setCreatingBranch(false)} /> : null}
    </S.Container>
  );
};

export default BranchTable;
