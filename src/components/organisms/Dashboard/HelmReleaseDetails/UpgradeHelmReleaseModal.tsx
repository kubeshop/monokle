import {useEffect} from 'react';
import {useAsync} from 'react-use';

import {Form, Input, Modal, Select} from 'antd';

import {useAppSelector} from '@redux/hooks';

import {useSearchHelmCharts} from '@hooks/useSearchHelmCharts';

import {runCommandInMainThread, searchHelmRepoCommand} from '@shared/utils/commands';

interface IProps {
  onClose: () => void;
  onOk?: (repo: string, version: string) => void;
  isDryRun?: boolean;
}

const UpgradeHelmReleaseModal = ({onClose, onOk, isDryRun}: IProps) => {
  const [form] = Form.useForm();
  const selectedRepo = Form.useWatch('repo', form);
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  const {result: repos, loading} = useSearchHelmCharts(release.chart.slice(0, release.chart.lastIndexOf('-')), false);

  const onUpgradeClickHandler = async () => {
    form.submit();
    const values = await form.validateFields();
    onOk && onOk(values.repo, values.version);
    onClose();
  };

  const {value: versions = [], loading: isLoadingVersions} = useAsync(async (): Promise<{version: string}[]> => {
    const result = await runCommandInMainThread(searchHelmRepoCommand({q: selectedRepo}, true));
    return JSON.parse(result.stdout || '[]');
  }, [selectedRepo]);

  useEffect(() => {
    form.setFieldValue('version', '');
  }, [form, selectedRepo]);

  const suggestedRepoName =
    release.name.slice(0, release.name.indexOf('-')) || release.chart.slice(0, release.chart.indexOf('-'));

  return loading ? null : (
    <Modal
      open
      onCancel={onClose}
      getContainer="helmDiffModalContainer"
      okText={isDryRun ? 'Dry-run Update' : 'Update'}
      onOk={onUpgradeClickHandler}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="chart" label="Chart" initialValue={release.chart}>
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="repo"
          label="Repo"
          rules={[{required: true}]}
          initialValue={
            repos.length === 1 ? repos[0].name : repos.find(ch => ch.name.startsWith(suggestedRepoName))?.name || ''
          }
        >
          <Select>
            {repos.map(ch => (
              <Select.Option key={ch.name} value={ch.name}>
                {ch.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="version"
          label="version"
          dependencies={['repo']}
          rules={[{required: true}]}
          initialValue={release.chart.slice(release.chart.lastIndexOf('-') + 1)}
        >
          <Select loading={isLoadingVersions}>
            {versions.map(v => (
              <Select.Option key={v.version} value={v.version}>
                {v.version}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpgradeHelmReleaseModal;
