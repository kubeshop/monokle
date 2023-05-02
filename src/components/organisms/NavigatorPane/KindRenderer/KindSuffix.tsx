import React, {useCallback, useMemo} from 'react';

import {Button, Tooltip} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {DisabledAddResourceTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {NewResourceWizardInput} from '@shared/models/ui';
import {Colors} from '@shared/styles/colors';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';

const SuffixContainer = styled.span`
  display: inline-block;
`;

const ButtonContainer = styled.span`
  display: flex;
  align-items: center;
  padding: 0 4px;
  margin-right: 16px;

  & .ant-btn-sm {
    height: 20px;
    width: 20px;
  }
`;

type Props = {
  kind: string;
  isSelected: boolean;
};

const KindSuffix: React.FC<Props> = props => {
  const {kind: resourceKind, isSelected} = props;
  const dispatch = useAppDispatch();

  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isSectionCollapsed = useAppSelector(state => state.ui.navigator.collapsedResourceKinds.includes(resourceKind));

  const isAddResourceDisabled = useMemo(() => isInPreviewMode || isInClusterMode, [isInClusterMode, isInPreviewMode]);

  const createResource = useCallback(() => {
    if (!resourceKind) {
      return;
    }
    const kindHandler = getResourceKindHandler(resourceKind);
    const input: NewResourceWizardInput = {
      kind: resourceKind,
      apiVersion: kindHandler?.clusterApiVersion,
    };
    dispatch(openNewResourceWizard({defaultInput: input}));
  }, [resourceKind, dispatch]);

  if (!resourceKind || !getResourceKindHandler(resourceKind) || !isFolderOpen) {
    return null;
  }

  return (
    <SuffixContainer>
      <ButtonContainer>
        <Tooltip
          mouseEnterDelay={TOOLTIP_DELAY}
          title={
            isAddResourceDisabled
              ? DisabledAddResourceTooltip({type: isInClusterMode ? 'cluster' : 'preview', kind: resourceKind})
              : `Create a new ${resourceKind}`
          }
        >
          <Button
            icon={<PlusOutlined />}
            type="link"
            onClick={createResource}
            size="small"
            disabled={isAddResourceDisabled}
            style={{color: isSelected && isSectionCollapsed ? Colors.blackPure : undefined}}
          />
        </Tooltip>
      </ButtonContainer>
    </SuffixContainer>
  );
};

export default KindSuffix;
