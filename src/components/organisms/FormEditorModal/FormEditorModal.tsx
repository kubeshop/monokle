import React, {useEffect, useMemo} from 'react';
import {useWindowSize} from 'react-use';

import {Button, Col, Modal, Row} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLastChangedLine} from '@redux/reducers/main';
import {useSelectedResourceMeta} from '@redux/selectors/resourceSelectors';
import {isKustomizationResource} from '@redux/services/kustomize';
import {getResourceSchema} from '@redux/services/schema';

import {FormEditor, Monaco} from '@components/molecules';

import {getResourceKindHandler} from '@src/kindhandlers';
import {extractFormSchema} from '@src/kindhandlers/common/customObjectKindHandler';

import {isLocalResourceMeta} from '@shared/models/k8sResource';

import * as S from './FormEditorModal.styled';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const FormEditorModal: React.FC<Props> = ({visible, onClose}) => {
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const selectedResourceMeta = useSelectedResourceMeta();
  const sizeProps = useModalSize();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLastChangedLine(0));
  }, [dispatch]);

  const isKustomization = useMemo(() => isKustomizationResource(selectedResourceMeta), [selectedResourceMeta]);
  const resourceKindHandler = useMemo(
    () => (selectedResourceMeta && !isKustomization ? getResourceKindHandler(selectedResourceMeta.kind) : undefined),
    [isKustomization, selectedResourceMeta]
  );

  return (
    <Modal
      footer={
        <Button type="primary" onClick={onClose}>
          Done
        </Button>
      }
      title="Form Editor"
      open={visible}
      onCancel={onClose}
      onOk={onClose}
      {...sizeProps}
    >
      <Row>
        <Col span={24}>
          <S.SourceNameBlock>
            {selectedResourceMeta && isLocalResourceMeta(selectedResourceMeta) && (
              <S.FilePath>
                <span>File:</span>
                {selectedResourceMeta.origin.filePath}
              </S.FilePath>
            )}
            <S.FileName>
              <span>Resource:</span>
              {selectedResourceMeta?.name}
            </S.FileName>
          </S.SourceNameBlock>
        </Col>
      </Row>
      <Row style={{height: '100%', flexFlow: 'nowrap'}}>
        <S.StyledCol span={12} style={{height: 'auto'}}>
          <S.BlockTitle>Source</S.BlockTitle>
          <Monaco applySelection={() => {}} diffSelectedResource={() => {}} />
        </S.StyledCol>
        <Col span={1} />
        <S.StyledCol span={11}>
          <S.BlockTitle>Form</S.BlockTitle>
          {isKustomization && selectedResourceMeta ? (
            <FormEditor
              formSchema={extractFormSchema(
                getResourceSchema(selectedResourceMeta, String(k8sVersion), String(userDataDir))
              )}
            />
          ) : (
            resourceKindHandler?.formEditorOptions && (
              <FormEditor
                formSchema={resourceKindHandler.formEditorOptions.editorSchema}
                formUiSchema={resourceKindHandler.formEditorOptions.editorUiSchema}
              />
            )
          )}
        </S.StyledCol>
      </Row>
    </Modal>
  );
};

/* * * * * * * * * * * * * *
 * Modal size hook
 * * * * * * * * * * * * * */
type ModalSizeProps = {
  width: number;
  bodyStyle: {height: number; overflow: string};
  style: {top: number};
};

function useModalSize(): ModalSizeProps {
  const windowSize = useWindowSize();
  const modalHeaderHeight = 55;
  const percentage = 0.9;

  return {
    width: windowSize.width * percentage,
    bodyStyle: {
      height: (windowSize.height - modalHeaderHeight) * percentage,
      overflow: 'hidden',
    },
    style: {
      top: 25,
    },
  };
}

export default FormEditorModal;
