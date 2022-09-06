import {useMemo} from 'react';

import {ColumnsType} from 'antd/lib/table';

import styled from 'styled-components';

import {GitBranch} from '@models/git';

import Colors from '@styles/Colors';

import {NameCell} from './BranchCell';

type Props = {
  branchCount: number;
  onSelect: (branch: GitBranch) => void;
};

export function useBranchTable({branchCount, onSelect}: Props) {
  const columns: ColumnsType<GitBranch> = useMemo(() => {
    return [
      {
        key: 'name',
        title: <PrimaryTitle>{branchCount} active branches</PrimaryTitle>,
        render: (_, branch) => <NameCell onSelect={onSelect} branch={branch} />,
      },
      // {
      //   key: 'view',
      //   // title: <SecondaryTitle>View on repository</SecondaryTitle>,
      //   // render: (_, branch) => <span>Testing...</span>,
      //   width: 160,
      // },
    ];
  }, [branchCount, onSelect]);

  return columns;
}

const PrimaryTitle = styled.div`
  font-size: 16px;
  color: ${Colors.grey9};
  font-weight: 700;
`;
