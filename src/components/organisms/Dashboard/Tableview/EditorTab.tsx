import {useAppSelector} from '@redux/hooks';

import {Monaco} from '@components/molecules';

import {ResourceSelection} from '@shared/models/selection';

import * as S from './EditorTab.styled';

export const EditorTab = () => {
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);

  const resourceSelection: ResourceSelection | undefined = selectedResourceId
    ? {type: 'resource', resourceIdentifier: {id: selectedResourceId, storage: 'cluster'}}
    : undefined;

  return (
    <S.Container>
      <Monaco providedResourceSelection={resourceSelection} applySelection={() => {}} diffSelectedResource={() => {}} />
    </S.Container>
  );
};
