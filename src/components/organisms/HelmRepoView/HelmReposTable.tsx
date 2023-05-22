import {useAsync} from 'react-use';

import {Typography} from 'antd';

import {SearchOutlined} from '@ant-design/icons';

import {listHelmRepoCommand, runCommandInMainThread} from '@shared/utils/commands';

import * as S from './styled';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: true,
    responsive: ['sm'],
  },
  {
    title: 'url',
    dataIndex: 'url',
    key: 'url',
    responsive: ['sm'],
  },
];

const HelmReposTable = () => {
  const {value: data = [], loading} = useAsync(async () => {
    const result = await runCommandInMainThread(listHelmRepoCommand());
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout || '[]');
  });

  const reposCount = data.length;

  return (
    <>
      <Typography.Text>Add a new Helm Chart repository</Typography.Text>
      <S.Input placeholder="Enter a valid repository URL and click to proceed" prefix={<SearchOutlined />} />
      <Typography.Text>{reposCount} Helm Chart repositories added. You can update or delete them.</Typography.Text>
      <S.Table rowKey="name" columns={columns} dataSource={data} pagination={false} loading={loading} />
    </>
  );
};

export default HelmReposTable;
