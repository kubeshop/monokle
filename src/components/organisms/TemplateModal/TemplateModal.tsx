import {shell} from 'electron';

import React, {LegacyRef, useCallback, useMemo, useState} from 'react';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {Button, Skeleton, Steps, Tag} from 'antd';

import {Primitive} from 'type-fest';

import {Project} from '@models/appconfig';
import {K8sResource} from '@models/k8sresource';
import {AnyTemplate, isReferencedHelmChartTemplate, isVanillaTemplate} from '@models/template';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/selectors';
import {previewReferencedHelmChart} from '@redux/services/previewReferencedHelmChart';
import {createUnsavedResourcesFromVanillaTemplate} from '@redux/services/templates';

import {TemplateFormRenderer} from '@components/molecules';

import * as S from './styled';

type TemplateModalProps = {template: AnyTemplate; onClose: (status: string) => void; projectToCreate?: Project};

type FormDataList = Record<string, Primitive>[];

const TemplateModal: React.FC<TemplateModalProps> = props => {
  const {template, onClose, projectToCreate} = props;

  const dispatch = useAppDispatch();
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const userTempDir = useAppSelector(state => state.config.userTempDir);

  const [activeFormIndex, setActiveFormIndex] = useState<number>(0);
  const [currentFormDataList, setCurrentFormDataList] = useState<FormDataList>(template.forms.map(() => ({})));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>();
  const [createdResources, setCreatedResources] = useState<K8sResource[]>([]);

  const [containerRef, {height: containerHeight}] = useMeasure<HTMLDivElement>();

  const activeForm = useMemo(() => {
    return activeFormIndex && activeFormIndex <= template.forms.length
      ? template.forms[activeFormIndex - 1]
      : undefined;
  }, [template.forms, activeFormIndex]);

  const onClickSubmit = useCallback(
    (formDataList: Record<string, Primitive>[]) => {
      if (projectToCreate) {
        dispatch(setCreateProject({...projectToCreate}));
        onClose('PREVIEW');
      }

      if (isVanillaTemplate(template)) {
        setIsLoading(true);
        // remove first entry - which is the intro page
        formDataList.shift();
        createUnsavedResourcesFromVanillaTemplate(template, formDataList, dispatch)
          .then(({message, resources}) => {
            setResultMessage(message);
            setCreatedResources(resources);
            setIsLoading(false);
          })
          .catch((err: Error) => {
            setResultMessage(err.message);
            setIsLoading(false);
          });
        return;
      }

      if (!isReferencedHelmChartTemplate(template) || !userTempDir || !kubeConfigPath || !kubeConfigContext) {
        return;
      }
      setIsLoading(true);
      previewReferencedHelmChart(
        template.chartName,
        template.chartVersion,
        template.chartRepo,
        template.valuesFilePath,
        formDataList,
        kubeConfigPath,
        kubeConfigContext,
        userTempDir,
        dispatch
      )
        .then(({message, resources}) => {
          setResultMessage(message);
          setCreatedResources(resources);
          setIsLoading(false);
        })
        .catch((err: Error) => {
          setResultMessage(err.message);
          setIsLoading(false);
        });
    },
    [template, userTempDir, kubeConfigPath, kubeConfigContext, dispatch]
  );

  const setFormData = useCallback(
    (formIndex: number, formData: Record<string, Primitive>) => {
      const newFormDataList = currentFormDataList.slice(0);
      newFormDataList.splice(formIndex, 1, formData);
      setCurrentFormDataList(newFormDataList);
      setActiveFormIndex(formIndex + 1);
      if (formIndex === template.forms.length) {
        onClickSubmit(newFormDataList);
      }
    },
    [currentFormDataList, onClickSubmit, template.forms.length]
  );

  const onFormSubmit = (formIndex: number, formData: any) => {
    setFormData(formIndex, formData);
  };

  const close = (status: string) => {
    setIsLoading(false);
    setResultMessage(undefined);
    setCreatedResources([]);
    setCurrentFormDataList([]);
    onClose(status);
  };

  const openHelpUrl = () => {
    if (template.helpUrl) {
      shell.openExternal(template.helpUrl);
    }
  };

  const openRepository = () => {
    if (template.repository) {
      shell.openExternal(template.repository);
    }
  };

  if (activeFormIndex && !activeForm && !resultMessage && !isLoading) {
    return <p>Something went wrong...</p>;
  }

  return (
    <S.Modal
      title={
        <S.ModalTitle>
          <S.TemplateIcon />
          <span>{template.name}</span>
        </S.ModalTitle>
      }
      visible
      footer={
        activeFormIndex === 0 ? (
          <Button htmlType="submit" type="primary" loading={isLoading} onClick={() => setActiveFormIndex(1)}>
            Start
          </Button>
        ) : resultMessage ? (
          <Button type="primary" onClick={() => close('DONE')} loading={isLoading}>
            Done
          </Button>
        ) : null
      }
      onCancel={() => close('CANCELED')}
      width="min-content"
    >
      <ResizableBox
        height={containerHeight}
        width={800}
        minConstraints={[800, containerHeight]}
        maxConstraints={[window.innerWidth - 64, containerHeight]}
        axis="x"
        resizeHandles={['w', 'e']}
        handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => (
          <span className={`custom-modal-handle custom-modal-handle-${h}`} ref={ref} />
        )}
      >
        <S.Container ref={containerRef}>
          <S.StepsContainer>
            <Steps direction="vertical" current={activeFormIndex}>
              <S.Step title="Information" />
              {template.forms.map(form => {
                return <S.Step key={form.name} title={form.name} />;
              })}
              <S.Step title="Result" />
            </Steps>
          </S.StepsContainer>

          <S.FormContainer>
            {isLoading ? (
              <Skeleton />
            ) : activeFormIndex === 0 ? (
              <S.Table>
                <tbody>
                  <tr>
                    <S.TableHead>Author</S.TableHead>
                    <S.TableData>{template.author}</S.TableData>
                  </tr>
                  <tr>
                    <S.TableHead>Version</S.TableHead>
                    <S.TableData>{template.version}</S.TableData>
                  </tr>
                  {template.repository ? (
                    <tr>
                      <S.TableHead>Repository</S.TableHead>
                      <S.TableData>
                        <a onClick={openRepository}>{template.repository}</a>
                      </S.TableData>
                    </tr>
                  ) : null}
                  {template.helpUrl ? (
                    <tr>
                      <S.TableHead>Help URL</S.TableHead>
                      <S.TableData>
                        <a onClick={openHelpUrl}>{template.helpUrl}</a>
                      </S.TableData>
                    </tr>
                  ) : null}
                  <tr>
                    <S.TableHead>Description</S.TableHead>
                    <S.TableData>{template.description}</S.TableData>
                  </tr>
                </tbody>
              </S.Table>
            ) : resultMessage ? (
              <>
                {createdResources.length === 0 ? (
                  <S.CreatedResourceLabel>
                    Processed the template successfully but the output did not create any valid resources.
                  </S.CreatedResourceLabel>
                ) : (
                  <>
                    <S.CreatedResourceLabel>Created the following resources:</S.CreatedResourceLabel>
                    <ul>
                      {createdResources.map(resource => {
                        return (
                          <li key={resource.id}>
                            {resource.namespace && <Tag title={resource.namespace} />}
                            <S.CreatedResourceName>{resource.name}*</S.CreatedResourceName>
                            <S.CreatedResourceKind>{resource.kind}</S.CreatedResourceKind>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
                <S.StyledTextArea rows={10} value={resultMessage} readOnly />
              </>
            ) : activeForm ? (
              <TemplateFormRenderer
                key={activeFormIndex}
                isLastForm={activeFormIndex === template.forms.length}
                onSubmit={formData => onFormSubmit(activeFormIndex, formData)}
                templateForm={activeForm}
              />
            ) : null}
          </S.FormContainer>
        </S.Container>
      </ResizableBox>
    </S.Modal>
  );
};

export default TemplateModal;
