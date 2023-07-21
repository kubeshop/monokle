import MonacoEditor, {monaco} from 'react-monaco-editor';
import {useAsync} from 'react-use';

import {Skeleton} from 'antd';

import {helmChartValuesCommand} from '@utils/helm';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {runCommandInMainThread} from '@shared/utils/commands';

interface IProps {
  chartName: string;
}

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  minimap: {
    enabled: false,
  },
  lineNumbers: 'off',
};

const HelmValues = ({chartName}: IProps) => {
  const {value, loading} = useAsync(async () => {
    const result = await runCommandInMainThread(helmChartValuesCommand({name: chartName}));
    return result.stdout;
  }, [chartName]);

  return loading ? (
    <Skeleton active={loading} />
  ) : (
    <MonacoEditor
      width="100%"
      height="85vh"
      theme={KUBESHOP_MONACO_THEME}
      options={monacoOptions}
      language="yaml"
      value={value}
    />
  );
};

export default HelmValues;
