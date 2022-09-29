import {useMemo} from 'react';

import {ColumnsType} from 'antd/lib/table';

import styled from 'styled-components';

import {GitBranch} from '@models/git';

import Colors from '@styles/Colors';

import BranchCell from './BranchCell';

type Props = {
  branchCount: number;
};

export function useBranchTable({branchCount}: Props) {
  const columns: ColumnsType<GitBranch> = useMemo(() => {
    return [
      {
        key: 'name',
        title: <PrimaryTitle>{branchCount} Active Branches</PrimaryTitle>,
        render: (_, branch) => <BranchCell branch={branch} />,
      },
      // {
      //   key: 'view',
      //   // title: <SecondaryTitle>View on repository</SecondaryTitle>,
      //   // render: (_, branch) => <span>Testing...</span>,
      //   width: 160,
      // },
    ];
  }, [branchCount]);

  return columns;
}

const PrimaryTitle = styled.div`
  font-size: 16px;
  color: ${Colors.grey9};
  font-weight: 700;
`;
