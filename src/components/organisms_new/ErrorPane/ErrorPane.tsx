import {useMemo} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';

import {useAppSelector} from '@redux/hooks';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {ErrorInfo, TitleBar} from '@monokle/components';
import {getRuleForResult} from '@monokle/validation';

import * as S from './ErrorPane.styled';

const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  minimap: {
    enabled: false,
  },
};

const ErrorPane: React.FC = () => {
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

  return (
    <S.ErrorPaneContainer>
      <TitleBar title="Editor" type="secondary" />

      <MonacoEditor theme={KUBESHOP_MONACO_THEME} options={monacoOptions} language="json" value={sarifValue} />

      {selectedProblem && <ErrorInfo error={selectedProblem} />}
    </S.ErrorPaneContainer>
  );
};

export default ErrorPane;
