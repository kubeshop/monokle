import MonacoEditor, {monaco} from 'react-monaco-editor';
import {useAsync} from 'react-use';

import {Skeleton} from 'antd';

import {useAppSelector} from '@redux/hooks';

import {getHelmReleaseManifestCommand} from '@utils/helm';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {runCommandInMainThread} from '@shared/utils/commands';

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  minimap: {
    enabled: false,
  },
  lineNumbers: 'off',
};

const HelmReleaseManifest = () => {
  const selectedHelmRelease = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);

  const {value = '', loading} = useAsync(async () => {
    const result = await runCommandInMainThread(
      getHelmReleaseManifestCommand({release: selectedHelmRelease.name, namespace: selectedHelmRelease.namespace})
    );
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return result.stdout;
  }, [selectedHelmRelease?.name, selectedHelmRelease?.namespace]);

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

export default HelmReleaseManifest;
