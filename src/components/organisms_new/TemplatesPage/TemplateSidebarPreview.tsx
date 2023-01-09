import {shell} from 'electron';

import React, {useCallback, useMemo, useState} from 'react';
import {useMeasure} from 'react-use';

import {Collapse, Form, Skeleton, Tag} from 'antd';

import {CaretRightOutlined} from '@ant-design/icons';

import {Primitive} from 'type-fest';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
// import {setCreateProject} from '@redux/reducers/appConfig';
import {kubeConfigPathSelector} from '@redux/selectors';
import {createUnsavedResourcesFromVanillaTemplate} from '@redux/services/templates';
import {previewReferencedHelmChart} from '@redux/thunks/previewReferencedHelmChart';

import {TemplateFormRenderer} from '@molecules';

import {K8sResource} from '@shared/models';
import {AnyTemplate, isReferencedHelmChartTemplate, isVanillaTemplate} from '@shared/models/template';
import {TutorialReferenceLink} from '@shared/models/tutorialReferences';
import {kubeConfigContextSelector, trackEvent} from '@shared/utils';

import {ReadMore} from './ReadMore';
import * as S from './TemplateSidebarPreview.styled';

type LayoutType = Parameters<typeof Form>[0]['layout'];

const {Panel} = Collapse;

const text = `Basic Service Deployment`;

type FormDataList = Record<string, Primitive>[];

// const TemplateSidebarPreview: React.FC<TemplateSidebarPreviewProps> = props => {
//   const {template, projectToCreate, tutorialReferenceLink} = props;
//   const {type, learnMoreUrl} = tutorialReferenceLink;
//   const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);
//
//   const openHelpUrl = () => {
//     if (template.helpUrl) {
//       shell.openExternal(template.helpUrl);
//     }
//   };
//
//   const [form] = Form.useForm();
//   const [formLayout, setFormLayout] = useState<LayoutType>('horizontal');
//   const [activeFormIndex, setActiveFormIndex] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [currentFormDataList, setCurrentFormDataList] = useState<FormDataList>(template.forms.map(() => ({})));
//   const [resultMessage, setResultMessage] = useState<string>();
//   const [createdResources, setCreatedResources] = useState<K8sResource[]>([]);
//
//   const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
//   const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
//   const userTempDir = useAppSelector(state => state.config.userTempDir);
//
//   const onFormLayoutChange = ({layout}: {layout: LayoutType}) => {
//     setFormLayout(layout);
//   };
//
//   const dispatch = useAppDispatch();
//
//   const onClickSubmit = useCallback(
//     (formDataList: Record<string, Primitive>[]) => {
//       if (projectToCreate) {
//         trackEvent('app_start/create_project', {from: 'template', templateID: template.id});
//         dispatch(setCreateProject({...projectToCreate}));
//       }
//       // remove first entry - which is the intro page
//       formDataList.shift();
//
//       if (isVanillaTemplate(template)) {
//         trackEvent('edit/template_use', {templateID: template.id});
//         setIsLoading(true);
//         createUnsavedResourcesFromVanillaTemplate(template, formDataList, dispatch)
//           .then(({message, resources}) => {
//             setResultMessage(message);
//             setCreatedResources(resources);
//             setIsLoading(false);
//           })
//           .catch((err: Error) => {
//             setResultMessage(err.message);
//             setIsLoading(false);
//           });
//         return;
//       }
//
//       if (!isReferencedHelmChartTemplate(template) || !userTempDir || !kubeConfigPath || !kubeConfigContext) {
//         return;
//       }
//       setIsLoading(true);
//       trackEvent('edit/template_use', {templateID: template.id});
//       previewReferencedHelmChart(
//         template.chartName,
//         template.chartVersion,
//         template.chartRepo,
//         template.valuesFilePath,
//         formDataList,
//         kubeConfigPath,
//         kubeConfigContext,
//         userTempDir,
//         dispatch
//       )
//         .then(({message, resources}) => {
//           setResultMessage(message);
//           setCreatedResources(resources);
//           setIsLoading(false);
//         })
//         .catch((err: Error) => {
//           setResultMessage(err.message);
//           setIsLoading(false);
//         });
//     },
//     [template, userTempDir, kubeConfigPath, kubeConfigContext, dispatch]
//   );
//
//   const activeForm = useMemo(() => {
//     return activeFormIndex && activeFormIndex <= template.forms.length
//       ? template.forms[activeFormIndex - 1]
//       : undefined;
//   }, [template.forms, activeFormIndex]);
//
//   const setFormData = useCallback(
//     (formIndex: number, formData: Record<string, Primitive>) => {
//       const newFormDataList = currentFormDataList.slice(0);
//       newFormDataList.splice(formIndex, 1, formData);
//       setCurrentFormDataList(newFormDataList);
//       setActiveFormIndex(formIndex + 1);
//       if (formIndex === template.forms.length) {
//         onClickSubmit(newFormDataList);
//       }
//     },
//     [currentFormDataList, onClickSubmit, template.forms.length]
//   );
//
//   const onFormSubmit = (formIndex: number, formData: any) => {
//     setFormData(formIndex, formData);
//   };
//
//   if (activeFormIndex && !activeForm && !resultMessage && !isLoading) {
//     return <p>Something went wrong...</p>;
//   }
//
//   const openRepository = () => {
//     if (template.repository) {
//       shell.openExternal(template.repository);
//     }
//   };
//
//   return (
//     <S.TemplateSidebar key={type}>
//       <Collapse
//         defaultActiveKey={['1']}
//         expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 270} />}
//       >
//         <Panel header={text} key="1">
//           <S.DetailsColumn>
//             <S.DetailsHeader>
//               <span>Creator: </span>
//               <h5> olensmar</h5>
//             </S.DetailsHeader>
//             <S.DetailsHeader>
//               <span>Version: </span>
//               <h5> 1.0.0</h5>
//             </S.DetailsHeader>
//             <h5>
//               <ReadMore>
//                 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
//                 dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla
//                 et dictum interdum, nisi lorem egestas vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est,
//                 ultrices nec congue eget, auctor vitae massa. Fusce luctus vestibulum augue ut aliquet. Nunc sagittis
//                 dictum nisi, sed ullamcorper ipsum dignissim ac. In at libero sed nunc venenatis imperdiet sed ornare
//                 turpis. Donec vitae dui eget tellus gravida venenatis. Integer fringilla congue eros non fermentum. Sed
//                 dapibus pulvinar nibh tempor porta.
//               </ReadMore>
//             </h5>
//           </S.DetailsColumn>
//           <S.ResourcesColumn>
//             <S.DetailsHeader>
//               <span>The following resources will be created: </span>
//             </S.DetailsHeader>
//             <S.ResourcesRefLink>
//               <S.Link onClick={openLearnMore}>SomeAppVersion</S.Link>
//             </S.ResourcesRefLink>
//             <S.ResourcesRefLink>
//               <S.Link onClick={openLearnMore}>AnotherAppVersion</S.Link>
//             </S.ResourcesRefLink>
//             <S.ResourcesRefLink>
//               <S.Link onClick={openLearnMore}>RoleBinding</S.Link>
//             </S.ResourcesRefLink>
//             <S.ResourcesRefLink>
//               <S.Link onClick={openLearnMore}>ServiceAccount</S.Link>
//             </S.ResourcesRefLink>
//           </S.ResourcesColumn>
//         </Panel>
//       </Collapse>
//       <div className="columns">
//         <div className="column active">
//           <S.ElipseStepWrapper>1</S.ElipseStepWrapper>
//           <S.StepTitle>
//             <span>
//               <S.Title>
//                 <span>Start</span>
//                 <S.Divider />
//               </S.Title>
//             </span>
//             <S.StepSubTitle>Let’s begin creating...</S.StepSubTitle>
//           </S.StepTitle>
//         </div>
//         <div className="column">
//           <S.ElipseStepWrapper>2</S.ElipseStepWrapper>
//           <S.StepTitle>
//             <span>
//               <S.Title>
//                 <span>Some more settings</span>
//                 <S.Divider />
//               </S.Title>
//             </span>
//             <S.StepSubTitle>It’ll be quick!</S.StepSubTitle>
//           </S.StepTitle>
//         </div>
//         <div className="column">
//           <S.ElipseStepWrapper>3</S.ElipseStepWrapper>
//           <S.StepTitle>
//             <span>
//               <S.Title>
//                 <span>Done!</span>
//                 <S.Divider />
//               </S.Title>
//             </span>
//             <S.StepSubTitle>Resources are ready</S.StepSubTitle>
//           </S.StepTitle>
//         </div>
//       </div>
//       <S.FormWrapper>
//         <S.Title>Start</S.Title>
//         <Form layout="vertical" form={form} initialValues={{layout: formLayout}} onValuesChange={onFormLayoutChange}>
//           <Form.Item label="Something">
//             <Input placeholder="All or part of a name" />
//           </Form.Item>
//           <Form.Item label="Another Thing">
//             <Input placeholder="input placeholder" />
//           </Form.Item>
//           <Form.Item label="Yet Another Thing">
//             <Input placeholder="input placeholder" />
//           </Form.Item>
//           <Form.Item className="SubmitWrapper">
//             <Button type="primary">Submit</Button>
//             <S.Link onClick={openLearnMore}>Back</S.Link>
//           </Form.Item>
//         </Form>
//       </S.FormWrapper>
//
//       <S.FormContainer>
//         {isLoading ? (
//           <Skeleton />
//         ) : activeFormIndex === 0 ? (
//           <S.Table>
//             <tbody>
//               <tr>
//                 <S.TableHead>Author</S.TableHead>
//                 <S.TableData>{template.author}</S.TableData>
//               </tr>
//               <tr>
//                 <S.TableHead>Version</S.TableHead>
//                 <S.TableData>{template.version}</S.TableData>
//               </tr>
//               {template.repository ? (
//                 <tr>
//                   <S.TableHead>Repository</S.TableHead>
//                   <S.TableData>
//                     <a onClick={openRepository}>{template.repository}</a>
//                   </S.TableData>
//                 </tr>
//               ) : null}
//               {template.helpUrl ? (
//                 <tr>
//                   <S.TableHead>Help URL</S.TableHead>
//                   <S.TableData>
//                     <a onClick={openHelpUrl}>{template.helpUrl}</a>
//                   </S.TableData>
//                 </tr>
//               ) : null}
//               <tr>
//                 <S.TableHead>Description</S.TableHead>
//                 <S.TableData>{template.description}</S.TableData>
//               </tr>
//             </tbody>
//           </S.Table>
//         ) : resultMessage ? (
//           <>
//             {createdResources.length === 0 ? (
//               <S.CreatedResourceLabel>
//                 Processed the template successfully but the output did not create any valid resources.
//               </S.CreatedResourceLabel>
//             ) : (
//               <>
//                 <S.CreatedResourceLabel>Created the following resources:</S.CreatedResourceLabel>
//                 <ul>
//                   {createdResources.map(resource => {
//                     return (
//                       <li key={resource.id}>
//                         {resource.namespace && <Tag title={resource.namespace} />}
//                         <S.CreatedResourceName>{resource.name}*</S.CreatedResourceName>
//                         <S.CreatedResourceKind>{resource.kind}</S.CreatedResourceKind>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               </>
//             )}
//             <S.StyledTextArea rows={10} value={resultMessage} readOnly />
//           </>
//         ) : activeForm ? (
//           <TemplateFormRenderer
//             key={activeFormIndex}
//             isLastForm={activeFormIndex === template.forms.length}
//             onSubmit={formData => onFormSubmit(activeFormIndex, formData)}
//             templateForm={activeForm}
//           />
//         ) : null}
//       </S.FormContainer>
//     </S.TemplateSidebar>
//   );
// };

type TemplateProps = {tutorialReferenceLink: TutorialReferenceLink; template: AnyTemplate};

const TemplateSidebarPreview: React.FC<TemplateProps> = props => {
  const {tutorialReferenceLink, template} = props;

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
  const {learnMoreUrl} = tutorialReferenceLink;
  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  // const [form] = Form.useForm();
  // const [formLayout, setFormLayout] = useState<LayoutType>('horizontal');
  //
  // const onFormLayoutChange = ({layout}: {layout: LayoutType}) => {
  //   setFormLayout(layout);
  // };

  const activeForm = useMemo(() => {
    return activeFormIndex && activeFormIndex <= template.forms.length
      ? template.forms[activeFormIndex - 1]
      : undefined;
  }, [template.forms, activeFormIndex]);

  const onClickSubmit = useCallback(
    (formDataList: Record<string, Primitive>[]) => {
      // if (projectToCreate) {
      //   trackEvent('app_start/create_project', {from: 'template', templateID: template.id});
      //   dispatch(setCreateProject({...projectToCreate}));
      // }

      // remove first entry - which is the intro page
      formDataList.shift();

      if (isVanillaTemplate(template)) {
        trackEvent('edit/template_use', {templateID: template.id});
        setIsLoading(true);
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
          setIsLoading(false);
          onFormSubmit(activeFormIndex, template.forms);
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
      setIsLoading(false);
      setResultMessage(undefined);
      setCreatedResources([]);
      setCurrentFormDataList([]);

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

  if (activeFormIndex && !activeForm && !resultMessage && !isLoading) {
    return <p>Something went wrong...</p>;
  }

  const onFormSubmit = (formIndex: number, formData: any) => {
    setFormData(formIndex, formData);
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
    <S.TemplateSidebar>
      <Collapse
        defaultActiveKey={['1']}
        expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 270} />}
      >
        <Panel header={text} key="1">
          <S.DetailsColumn>
            <S.DetailsHeader>
              <span>Creator: </span>
              <h5> olensmar</h5>
            </S.DetailsHeader>
            <S.DetailsHeader>
              <span>Version: </span>
              <h5> 1.0.0</h5>
            </S.DetailsHeader>
            <h5>
              <ReadMore>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla
                et dictum interdum, nisi lorem egestas vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est,
                ultrices nec congue eget, auctor vitae massa. Fusce luctus vestibulum augue ut aliquet. Nunc sagittis
                dictum nisi, sed ullamcorper ipsum dignissim ac. In at libero sed nunc venenatis imperdiet sed ornare
                turpis. Donec vitae dui eget tellus gravida venenatis. Integer fringilla congue eros non fermentum. Sed
                dapibus pulvinar nibh tempor porta.
              </ReadMore>
            </h5>
          </S.DetailsColumn>
          <S.ResourcesColumn>
            <S.DetailsHeader>
              <span>The following resources will be created: </span>
            </S.DetailsHeader>
            <S.ResourcesRefLink>
              <S.Link onClick={openLearnMore}>SomeAppVersion</S.Link>
            </S.ResourcesRefLink>
            <S.ResourcesRefLink>
              <S.Link onClick={openLearnMore}>AnotherAppVersion</S.Link>
            </S.ResourcesRefLink>
            <S.ResourcesRefLink>
              <S.Link onClick={openLearnMore}>RoleBinding</S.Link>
            </S.ResourcesRefLink>
            <S.ResourcesRefLink>
              <S.Link onClick={openLearnMore}>ServiceAccount</S.Link>
            </S.ResourcesRefLink>
          </S.ResourcesColumn>
        </Panel>
      </Collapse>
      <div className="columns">
        <div className="column active">
          <S.ElipseStepWrapper>1</S.ElipseStepWrapper>
          <S.StepTitle>
            <span>
              <S.Title>
                <span>Start</span>
                <S.Divider />
              </S.Title>
            </span>
            <S.StepSubTitle>Let’s begin creating...</S.StepSubTitle>
          </S.StepTitle>
        </div>
        <div className="column">
          <S.ElipseStepWrapper>2</S.ElipseStepWrapper>
          <S.StepTitle>
            <span>
              <S.Title>
                <span>Some more settings</span>
                <S.Divider />
              </S.Title>
            </span>
            <S.StepSubTitle>It’ll be quick!</S.StepSubTitle>
          </S.StepTitle>
        </div>
        <div className="column">
          <S.ElipseStepWrapper>3</S.ElipseStepWrapper>
          <S.StepTitle>
            <span>
              <S.Title>
                <span>Done!</span>
                <S.Divider />
              </S.Title>
            </span>
            <S.StepSubTitle>Resources are ready</S.StepSubTitle>
          </S.StepTitle>
        </div>
      </div>

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
    </S.TemplateSidebar>
  );
};
export default TemplateSidebarPreview;

// {/*<S.FormWrapper>*/}
// {/*  <S.Title>Start</S.Title>*/}
// {/*  <Form layout="vertical" form={form} initialValues={{layout: formLayout}} onValuesChange={onFormLayoutChange}>*/}
// {/*    <Form.Item label="Something">*/}
// {/*      <Input placeholder="All or part of a name" />*/}
// {/*    </Form.Item>*/}
// {/*    <Form.Item label="Another Thing">*/}
// {/*      <Input placeholder="input placeholder" />*/}
// {/*    </Form.Item>*/}
// {/*    <Form.Item label="Yet Another Thing">*/}
// {/*      <Input placeholder="input placeholder" />*/}
// {/*    </Form.Item>*/}
// {/*    <Form.Item className="SubmitWrapper">*/}
// {/*      <Button type="primary">Submit</Button>*/}
// {/*      <S.Link onClick={openLearnMore}>Back</S.Link>*/}
// {/*    </Form.Item>*/}
// {/*  </Form>*/}
// {/*</S.FormWrapper>*/}
