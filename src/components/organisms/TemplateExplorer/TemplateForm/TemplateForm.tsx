import {useCallback, useEffect, useMemo, useState} from 'react';

import {Skeleton} from 'antd';

import {Primitive} from 'type-fest';

import {kubeConfigContextSelector, kubeConfigPathSelector, setCreateProject} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {createTransientResourcesFromVanillaTemplate} from '@redux/services/templates';
import {previewReferencedHelmChart} from '@redux/thunks/previewReferencedHelmChart';

import {TemplateFormRenderer} from '@components/molecules';

import {K8sResource} from '@shared/models/k8sResource';
import {isReferencedHelmChartTemplate, isVanillaTemplate} from '@shared/models/template';
import {trackEvent} from '@shared/utils/telemetry';
import {formatFormData} from '@shared/utils/templateForm';

import CreatedResources from '../CreatedResources';
import * as S from './TemplateForm.styled';

type FormDataList = Record<string, Primitive>[];

type IProps = {
  width: number;
};

const TemplateForm: React.FC<IProps> = props => {
  const {width} = props;

  const dispatch = useAppDispatch();
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const projectCreateData = useAppSelector(state => state.ui.templateExplorer.projectCreate);
  const template = useAppSelector(
    state => state.extension.templateMap[state.ui.templateExplorer.selectedTemplatePath ?? '']
  );
  const userTempDir = useAppSelector(state => state.config.userTempDir);

  const [activeFormIndex, setActiveFormIndex] = useState(0);
  const [createdResources, setCreatedResources] = useState<K8sResource[]>([]);
  const [currentFormDataList, setCurrentFormDataList] = useState<FormDataList>(template.forms.map(() => ({})));
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const activeForm = useMemo(
    () => (activeFormIndex <= template.forms.length ? template.forms[activeFormIndex] : undefined),
    [template, activeFormIndex]
  );
  const stepsItems = useMemo(
    () => [
      ...template.forms.map(form => ({key: form.name, title: form.name, description: form.description})),
      {key: 'result', title: 'Done!', description: 'Resources are ready'},
    ],
    [template]
  );

  const onClickSubmit = useCallback(
    (formDataList: Record<string, Primitive>[]) => {
      if (projectCreateData) {
        trackEvent('app_start/create_project', {from: 'template', templateID: template.id});
        dispatch(setCreateProject({...projectCreateData}));
      }

      if (isVanillaTemplate(template)) {
        trackEvent('edit/template_use', {templateID: template.id});
        setLoading(true);
        createTransientResourcesFromVanillaTemplate(template, formDataList, dispatch)
          .then(({message, resources}) => {
            setResultMessage(message);
            setCreatedResources(resources);
            setLoading(false);
          })
          .catch((err: Error) => {
            setResultMessage(err.message);
            setLoading(false);
          });
        return;
      }

      if (!isReferencedHelmChartTemplate(template) || !userTempDir || !kubeConfigPath || !kubeConfigContext) {
        return;
      }

      setLoading(true);
      trackEvent('edit/template_use', {templateID: template.id});
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
          setLoading(false);
        })
        .catch((err: Error) => {
          setResultMessage(err.message);
          setLoading(false);
        });
    },

    [projectCreateData, template, userTempDir, kubeConfigPath, kubeConfigContext, dispatch]
  );

  const setFormData = useCallback(
    (formIndex: number, formData: Record<string, Primitive>) => {
      const newFormDataList = currentFormDataList.slice(0);
      newFormDataList.splice(formIndex, 1, formatFormData(formData));
      setCurrentFormDataList(newFormDataList);
      setActiveFormIndex(formIndex + 1);

      if (formIndex === template.forms.length - 1) {
        onClickSubmit(newFormDataList);
      }
    },
    [currentFormDataList, onClickSubmit, template.forms.length]
  );

  useEffect(() => {
    setActiveFormIndex(0);
    setResultMessage('');
  }, [template]);

  if (!template) {
    return null;
  }

  if (activeFormIndex && !activeForm && !resultMessage && !loading) {
    return <p>Something went wrong...</p>;
  }

  return (
    <>
      <S.Steps $count={stepsItems.length} $width={width} current={activeFormIndex} items={stepsItems} />

      <S.FormContainer>
        {loading ? (
          <Skeleton active />
        ) : resultMessage ? (
          <CreatedResources createdResources={createdResources} resultMessage={resultMessage} />
        ) : activeForm ? (
          <TemplateFormRenderer
            key={activeFormIndex}
            defaultFormData={currentFormDataList[activeFormIndex]}
            isFirstForm={activeFormIndex === 0}
            isLastForm={activeFormIndex === template.forms.length - 1}
            templateForm={activeForm}
            onBackHandler={() => setActiveFormIndex(prev => prev - 1)}
            onSubmit={formData => {
              setFormData(activeFormIndex, formData);
            }}
          />
        ) : null}
      </S.FormContainer>
    </>
  );
};

export default TemplateForm;
