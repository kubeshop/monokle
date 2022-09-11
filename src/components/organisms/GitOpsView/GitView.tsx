import {useEffect, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import {isEmpty} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@components/molecules';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import GitSelectItem from '@assets/GitSelectItem.svg';

import * as S from './GitView.styled';

const GitView: React.FC = () => {
  const selectedItem = useAppSelector(state => state.git.selectedItem);
  const changedFiles = useAppSelector(state => state.git.changedFiles);
  const [selected, setSelectedItem] = useState(selectedItem);
  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();
  const options = {
    readOnly: false,
    renderSideBySide: true,
    minimap: {
      enabled: false,
    },
  };

  useEffect(() => {
    const itemToUpdate = changedFiles.find(searchItem => searchItem.name === selectedItem?.name);
    setSelectedItem(itemToUpdate);
    // setSelectedItem(selectedItem);
  }, [changedFiles, selectedItem]);

  return (
    <S.GitPaneMainContainer id="GitOpsPane">
      <TitleBar title="Editor" />
      <S.GitFileBar>
        <S.GitRefFile>
          <S.FileType>Original</S.FileType>
          {isEmpty(selected) && <S.FileEmptyState>Select a file in the left</S.FileEmptyState>}
          {!isEmpty(selected) && (
            <>
              <S.FileName>{selected?.name}</S.FileName>
              <S.FilePath>{selected?.path}</S.FilePath>
            </>
          )}
        </S.GitRefFile>
        <S.GitChangedFile>
          <S.FileType type="changed">Changed</S.FileType>
          {isEmpty(selected) && <S.FileEmptyState>Select a file in the left</S.FileEmptyState>}
          {!isEmpty(selected) && (
            <>
              <S.FileName>{selected?.name}</S.FileName>
              <S.FilePath>{selected?.path}</S.FilePath>
            </>
          )}
        </S.GitChangedFile>
      </S.GitFileBar>
      <S.MonacoDiffContainer width="100%" ref={containerRef}>
        {!isEmpty(selected) && (
          <MonacoDiffEditor
            width={containerWidth}
            height={containerHeight}
            language="yaml"
            original={selected?.originalContent}
            value={selected?.modifiedContent}
            options={options}
            theme={KUBESHOP_MONACO_THEME}
          />
        )}

        {isEmpty(selected) && (
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
