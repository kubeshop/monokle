import MonacoEditor, {monaco} from 'react-monaco-editor';
import {useAsync, useMeasure} from 'react-use';

import {Skeleton} from 'antd';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {helmChartTemplateCommand, runCommandInMainThread} from '@shared/utils/commands';

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

const HelmTemplate = ({chartName}: IProps) => {
  const [ref, {height}] = useMeasure<HTMLDivElement>();
  const {value, loading} = useAsync(async () => {
    const result = await runCommandInMainThread(helmChartTemplateCommand({name: chartName}));
    return result.stdout;
  }, [chartName]);

  return loading ? (
    <Skeleton loading={loading} />
  ) : (
    <div ref={ref} style={{height: '100%', width: '100%', backgroundColor: 'purple'}}>
      <MonacoEditor
        width="100%"
        height="85vh"
        theme={KUBESHOP_MONACO_THEME}
        options={monacoOptions}
        language="yaml"
        value={value}
      />
    </div>
  );
};

export default HelmTemplate;
