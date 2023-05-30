import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {selectPreviewDisplayContent} from '@redux/reducers/main/selectors';

import {Tooltip} from '@components/atoms/Tooltip/Tooltip';

import {Icon} from '@monokle/components';
import {AnyPreview} from '@shared/models/preview';
import {Colors} from '@shared/styles';

export function PreviewLabel() {
  const preview = useAppSelector(state => state.main.preview);
  const previewDisplayContent = useAppSelector(selectPreviewDisplayContent);

  if (!preview) {
    return null;
  }

  return (
    <Tooltip title={previewDisplayContent.description}>
      <LabelBox>
        {PREVIEW_ICON_MAP[preview.type]}
        <LabelContent>
          Performing Dry-run <span style={{fontWeight: 700}}>{previewDisplayContent.name}</span>
        </LabelContent>
      </LabelBox>
    </Tooltip>
  );
}

const LabelBox = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  border-radius: 4px;
  padding: 0 1rem;
  height: 30px;
  background-color: ${Colors.cyan6};
  color: ${Colors.grey3};
  border: none;
`;

const LabelContent = styled.div`
  font-size: 12px;
  cursor: pointer;
`;

const PREVIEW_ICON_MAP: Record<AnyPreview['type'], JSX.Element> = {
  helm: <Icon name="helm" style={{fontSize: 16}} />,
  'helm-config': <Icon name="helm" style={{fontSize: 16}} />,
  kustomize: <Icon name="kustomize" style={{fontSize: 16}} />,
  command: <Icon name="terminal" style={{fontSize: 16}} />,
};
