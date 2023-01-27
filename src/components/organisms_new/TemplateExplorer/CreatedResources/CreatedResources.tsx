import {Tag} from 'antd';

import {isEmpty} from 'lodash';

import {useAppDispatch} from '@redux/hooks';
import {setSelectedTemplatePath} from '@redux/reducers/ui';

import {K8sResource} from '@shared/models/k8sResource';

import * as S from './CreatedResources.styled';

type IProps = {
  createdResources: K8sResource[];
  resultMessage: string;
};

const CreatedResources: React.FC<IProps> = props => {
  const {createdResources, resultMessage} = props;

  const dispatch = useAppDispatch();

  return (
    <>
      {isEmpty(createdResources) ? (
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

      <S.TextArea rows={10} value={resultMessage} readOnly />

      <S.DoneButton type="ghost" onClick={() => dispatch(setSelectedTemplatePath(undefined))}>
        Done
      </S.DoneButton>
    </>
  );
};

export default CreatedResources;
