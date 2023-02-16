import {Tag} from 'antd';
import Link from 'antd/lib/typography/Link';

import {SelectOutlined} from '@ant-design/icons';

import {isEmpty} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {closeTemplateExplorer, setSelectedTemplatePath} from '@redux/reducers/ui';

import {TitleBar} from '@monokle/components';
import {K8sResource} from '@shared/models/k8sResource';
import {activeProjectSelector} from '@shared/utils/selectors';

import * as S from './CreatedResources.styled';

type IProps = {
  createdResources: K8sResource[];
  resultMessage: string;
};

const CreatedResources: React.FC<IProps> = props => {
  const {createdResources, resultMessage} = props;

  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const projectCreateData = useAppSelector(state => state.ui.templateExplorer.projectCreate);

  const onSelectResourceHandler = (resource: K8sResource) => {
    dispatch(selectResource({resourceIdentifier: resource}));
    dispatch(closeTemplateExplorer());
  };

  return (
    <>
      {isEmpty(createdResources) ? (
        <S.CreatedResourceLabel>
          Processed the template successfully but the output did not create any valid resources.
        </S.CreatedResourceLabel>
      ) : (
        <>
          {projectCreateData && (
            <>
              <TitleBar
                title={<S.Title>Created project from template</S.Title>}
                description={
                  <S.Description>
                    You have successfully created a project from a template. You can close the explorer by clicking{' '}
                    <Link onClick={() => dispatch(closeTemplateExplorer())}>here</Link> or you can continue creating
                    resources from templates.
                  </S.Description>
                }
                type="secondary"
              />
              <br />
            </>
          )}

          <S.CreatedResourceLabel>Created the following resources:</S.CreatedResourceLabel>
          <ul>
            {createdResources.map(resource => {
              return (
                <li key={resource.id}>
                  {resource.namespace && <Tag title={resource.namespace} />}
                  <S.CreatedResourceName>{resource.name}*</S.CreatedResourceName>
                  <S.CreatedResourceKind>{resource.kind}</S.CreatedResourceKind>
                  <Link>
                    <SelectOutlined disabled={!activeProject} onClick={() => onSelectResourceHandler(resource)} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <S.TextArea rows={10} value={resultMessage} readOnly />

      <S.DoneButton type="ghost" onClick={() => dispatch(setSelectedTemplatePath(undefined))}>
        Done
      </S.DoneButton>
    </>
  );
};

export default CreatedResources;
