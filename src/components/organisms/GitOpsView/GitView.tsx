import {useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@components/molecules';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import GitSelectItem from '@assets/GitSelectItem.svg';

import * as S from './GitView.styled';

const GitView: React.FC = () => {
  // add redux logic after implementation with git flow
  const isSelectedItem = useAppSelector(state => state.git.selectedItem);
  const [selected, setSelectedItem] = useState(false);
  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();
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
          {!isSelectedItem && <S.FileEmptyState>Select a file in the left</S.FileEmptyState>}
          {isSelectedItem && (
            <>
              <S.FileName>Filename</S.FileName>
              <S.FilePath>filepath</S.FilePath>
            </>
          )}
        </S.GitRefFile>
        <S.GitChangedFile>
          <S.FileType type="changed">Changed</S.FileType>
          {!isSelectedItem && <S.FileEmptyState>Select a file in the left</S.FileEmptyState>}
          {isSelectedItem && (
            <>
              <S.FileName>Filename</S.FileName>
              <S.FilePath>filepath</S.FilePath>
            </>
          )}
        </S.GitChangedFile>
      </S.GitFileBar>
      <S.MonacoDiffContainer width="100%" ref={containerRef}>
        {isSelectedItem && (
          <MonacoDiffEditor
            width={containerWidth}
            height={containerHeight}
            language="yaml"
            original="original"
            value="changed"
            options={options}
            theme={KUBESHOP_MONACO_THEME}
          />
        )}

        {!isSelectedItem && (
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
