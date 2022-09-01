import {useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import {TitleBar} from '@components/molecules';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import GitSelectItem from '@assets/GitSelectItem.svg';

import * as S from './GitView.styled';

type Props = {
  height: number;
};

const GitView: React.FC<Props> = ({height}) => {
  // add redux logic after implementation with git flow
  const [selected, setSelectedItem] = useState(false);
  const [containerRef, {height: containerHeight}] = useMeasure<HTMLDivElement>();
  const options = {
    readOnly: false,
    renderSideBySide: true,
    minimap: {
      enabled: false,
    },
  };

  return (
    <S.GitPaneMainContainer id="GitOpsPane">
      <TitleBar title="Editor" />
      <S.GitFileBar>
        <S.GitRefFile>
          <S.FileType>Original</S.FileType>
          <S.FileEmptyState>Select a file in the left</S.FileEmptyState>
        </S.GitRefFile>
        <S.GitChangedFile>
          <S.FileType type="changed">Changed</S.FileType>
          <S.FileEmptyState>Select a file in the left</S.FileEmptyState>
        </S.GitChangedFile>
      </S.GitFileBar>
      <S.MonacoDiffContainer width="100%" ref={containerRef}>
        {selected && (
          <MonacoDiffEditor
            width="100%"
            height={containerHeight}
            language="yaml"
            original="original"
            value="changed"
            options={options}
            theme={KUBESHOP_MONACO_THEME}
          />
        )}

        {!selected && (
          <S.EmptyStateContainer>
            <S.EmptyStateItem>
              <S.GitEmptyImage src={GitSelectItem} />
            </S.EmptyStateItem>
          </S.EmptyStateContainer>
        )}
      </S.MonacoDiffContainer>
    </S.GitPaneMainContainer>
  );
};

export default GitView;
