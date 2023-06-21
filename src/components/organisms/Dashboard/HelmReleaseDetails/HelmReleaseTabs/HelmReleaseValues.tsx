import {monaco} from 'react-monaco-editor';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import {useAsync} from 'react-use';

import {Skeleton} from 'antd';

import {useAppSelector} from '@redux/hooks';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {getHelmReleaseValuesCommand, runCommandInMainThread} from '@shared/utils/commands';

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  minimap: {
    enabled: false,
  },
  lineNumbers: 'off',
};

const HelmReleaseValues = () => {
  const selectedHelmRelease = useAppSelector(state => state.ui.helmPane.selectedHelmRelease);
  const {value = '', loading} = useAsync(async () => {
    if (selectedHelmRelease === null) {
      return '';
    }
    const result = await runCommandInMainThread(
      getHelmReleaseValuesCommand({release: selectedHelmRelease.name, namespace: selectedHelmRelease.namespace})
    );
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return result.stdout;
  }, [selectedHelmRelease]);

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

export default HelmReleaseValues;
