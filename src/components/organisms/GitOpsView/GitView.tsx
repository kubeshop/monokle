import {MonacoDiffEditor, monaco} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import {isEmpty} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import SelectItemImage from '@components/atoms/SelectItemImage/SelectItemImage';
import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {TitleBar} from '@monokle/components';

import * as S from './GitView.styled';

const options: monaco.editor.IDiffEditorConstructionOptions = {
  readOnly: true,
  renderSideBySide: true,
  inDiffEditor: true,
  renderValidationDecorations: 'off',
  minimap: {
    enabled: false,
  },
};

const GitView: React.FC = () => {
  const selectedItem = useAppSelector(state => state.git.selectedItem);

  const height = usePaneHeight();

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  return (
    <S.GitPaneMainContainer id="GitOpsPane">
      <TitleBarWrapper>
        <TitleBar type="secondary" title="Editor" />
      </TitleBarWrapper>
      <S.GitFileBar>
        <S.GitRefFile>
          <S.FileType>Original</S.FileType>
          {isEmpty(selectedItem) && <S.FileEmptyState>Select a file in the left</S.FileEmptyState>}
          {!isEmpty(selectedItem) && (
            <>
              <S.FileName>{selectedItem?.name}</S.FileName>
              <S.FilePath>{selectedItem?.path}</S.FilePath>
            </>
          )}
        </S.GitRefFile>
        <S.GitChangedFile>
          <S.FileType type="changed">Changed</S.FileType>
          {isEmpty(selectedItem) && <S.FileEmptyState>Select a file in the left</S.FileEmptyState>}
          {!isEmpty(selectedItem) && (
            <>
              <S.FileName>{selectedItem?.name}</S.FileName>
              <S.FilePath>{selectedItem?.path}</S.FilePath>
            </>
          )}
        </S.GitChangedFile>
      </S.GitFileBar>

      <S.MonacoDiffContainer ref={containerRef} $height={height - 84}>
        {!isEmpty(selectedItem) && (
          <MonacoDiffEditor
            width={containerWidth}
            height={containerHeight}
            language="yaml"
            original={selectedItem?.originalContent}
            value={selectedItem?.modifiedContent}
            options={options}
            theme={KUBESHOP_MONACO_THEME}
          />
        )}

        {isEmpty(selectedItem) && (
          <S.EmptyStateContainer>
            <S.EmptyStateItem>
              <SelectItemImage text="Select a file in the left to diff changes." />
            </S.EmptyStateItem>
          </S.EmptyStateContainer>
        )}
      </S.MonacoDiffContainer>
    </S.GitPaneMainContainer>
  );
};

export default GitView;
