import MonacoEditor, {MonacoDiffEditor} from 'react-monaco-editor';

import invariant from 'tiny-invariant';

import {useAppSelector} from '@redux/hooks';
import {selectComparison} from '@redux/reducers/compare';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

export const ComparisonInspection = () => {
  const inspection = useAppSelector(state => state.compare.current.inspect);
  const comparison = useAppSelector(state => selectComparison(state.compare, inspection?.comparison));
  invariant(inspection && comparison, 'invalid_state');

  if (inspection.type === 'diff') {
    return (
      <MonacoDiffEditor
        language="yaml"
        original={comparison.left?.text}
        value={comparison.right?.text}
        theme={KUBESHOP_MONACO_THEME}
        options={{
          renderIndicators: false,
          renderOverviewRuler: false,
          renderSideBySide: true,
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          readOnly: true,
          scrollbar: {
            vertical: 'hidden',
          },
        }}
      />
    );
  }

  return (
    <MonacoEditor
      language="yaml"
      value={inspection.type === 'left' ? comparison.left?.text : comparison.right?.text}
      theme={KUBESHOP_MONACO_THEME}
      options={{
        automaticLayout: true,
        minimap: {
          enabled: false,
        },
        readOnly: true,
        scrollbar: {
          vertical: 'hidden',
        },
      }}
    />
  );
};
