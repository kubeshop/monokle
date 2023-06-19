import {Form, Input, Modal, Select} from 'antd';

import {useAppSelector} from '@redux/hooks';

import {useSearchHelmCharts} from '@hooks/useSearchHelmCharts';

import {runCommandInMainThread, upgradeHelmReleaseCommand} from '@shared/utils/commands';

interface IProps {
  onClose: () => void;
  onOk?: (repo: string) => void;
}

const UpgradeHelmReleaseModal = ({onClose, onOk}: IProps) => {
  const [form] = Form.useForm();
  const release = useAppSelector(state => state.ui.helmPane.selectedHelmRelease!);
  const {result: repos, loading} = useSearchHelmCharts(release.chart.slice(0, release.chart.lastIndexOf('-')), false);

  const onUpgradeClickHandler = async () => {
    form.submit();
    const values = await form.validateFields();
    onOk && onOk(values.repo);
    const result = await runCommandInMainThread(
      upgradeHelmReleaseCommand({release: release.name, chart: values.repo, namespace: release.namespace})
    );
    if (result.stderr) {
      return;
    }
    onClose();
  };

  return loading ? null : (
    <Modal open onCancel={onClose} getContainer="helmDiffModalContainer" okText="Upgrade" onOk={onUpgradeClickHandler}>
      <Form layout="vertical" form={form}>
        <Form.Item name="chart" label="Chart" initialValue={release.chart}>
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="repo"
          label="Repo"
          rules={[{required: true}]}
          initialValue={repos.length === 1 ? repos[0].name : undefined}
        >
          <Select>
            {repos.map(ch => (
              <Select.Option key={ch.name} value={ch.name}>
                {ch.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpgradeHelmReleaseModal;
