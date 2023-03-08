import {useEffect} from 'react';

import {Select as AntSelect, Form, Table, Typography} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {Colors} from '@shared/styles';
import {runCommandInMainThread, searchHelmRepoCommand} from '@shared/utils/commands';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Chart Version',
    dataIndex: 'chartVersion',
    key: 'chartVersion',
  },
  {
    title: 'App Version',
    dataIndex: 'appVersion',
    key: 'appVersion',
  },
];

const HelmRepoPane = () => {
  const [form] = Form.useForm();
  const filters = Form.useWatch([], form);
  const healmRepoSearch = useAppSelector(state => state.ui.helmRepo.search);
  const searchResultCount = 0;

  useEffect(() => {
    runCommandInMainThread(searchHelmRepoCommand({q: 'nginx'}))
      .then(console.log)
      .catch(console.error);
  });

  return (
    <Container>
      <Header>
        <Title>{searchResultCount} Helm Charts found</Title>

        <Form layout="inline" form={form}>
          <Form.Item name="publisher">
            <Select placeholder="Publisher">
              <Select.Option value="official">Official</Select.Option>
              <Select.Option value="verified">Verified publishers</Select.Option>
              <Select.Option value="cncf">CNCF</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="kind">
            <Select placeholder="Kind">
              <Select.Option value="containerImages">Containers images</Select.Option>
              <Select.Option value="falcoRules">Falco rules</Select.Option>
              <Select.Option value="helmCharts">Helm charts</Select.Option>
              <Select.Option value="krewKubectlPlugins">Krew kubectl plugins</Select.Option>
              <Select.Option value="olm">OLM operators</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="category">
            <Select placeholder="Category">
              <Select.Option value="integration">Integration and delivery</Select.Option>
              <Select.Option value="monitoring">Monitoring and logging</Select.Option>
              <Select.Option value="networking">Networking</Select.Option>
              <Select.Option value="security">Security</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="license">
            <Select placeholder="License">
              <Select.Option value="apache">Apache-2.0</Select.Option>
              <Select.Option value="mit">MIT</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="others">
            <Select placeholder="Others">
              <Select.Option value="onlyOperators">Only operators</Select.Option>
              <Select.Option value="includeDeprecated">Include deprecated</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Header>

      <Table columns={columns} />
    </Container>
  );
};

export default HelmRepoPane;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;
  padding: 12px 12px 12px 22px;
`;

const Header = styled.div`
  display: flex;
  background-color: ${Colors.grey3b};
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-radius: 4px;
`;

const Title = styled(Typography.Text)`
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
`;

const Select = styled(AntSelect)`
  width: 108px !important;
`;
