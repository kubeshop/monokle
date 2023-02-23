import {useMemo} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';

import {TabsProps} from 'antd';

import {useAppSelector} from '@redux/hooks';

import {Monaco} from '@components/molecules';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {getRuleForResult} from '@monokle/validation';

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  minimap: {
    enabled: false,
  },
  lineNumbers: 'off',
};

export function useProblemPaneMenuItems(width: number, height: number) {
  const lastResponse = useAppSelector(state => state.validation.lastResponse);
  const selectedProblem = useAppSelector(state => state.validation.validationOverview.selectedProblem?.problem ?? null);

  const rule = useMemo(() => {
    if (!lastResponse || !selectedProblem) {
      return null;
    }

    return getRuleForResult(lastResponse, selectedProblem);
  }, [lastResponse, selectedProblem]);

  const sarifValue = useMemo(() => {
    return JSON.stringify({...selectedProblem, rule: {...rule}}, null, 2);
  }, [rule, selectedProblem]);

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'editor',
        label: 'Editor',
        children: <Monaco height={height} applySelection={() => {}} diffSelectedResource={() => {}} />,
      },
      {
        key: 'sarif',
        label: 'SARIF',
        children: (
          <MonacoEditor
            width={width}
            height={height}
            theme={KUBESHOP_MONACO_THEME}
            options={monacoOptions}
            language="json"
            value={sarifValue}
          />
        ),
      },
    ],
    [height, sarifValue, width]
  );

  return items;
}
