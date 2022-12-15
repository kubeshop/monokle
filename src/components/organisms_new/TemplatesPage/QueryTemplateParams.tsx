import {FilterOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleMatchParams} from '@redux/reducers/main';

import {MatchParamProps} from '@shared/models/appState';

import * as S from './TemplatesPage.styled';

type Props = {
  setFindingMatches: (flag: boolean) => void;
};

const QueryTemplateParams: React.FC<Props> = ({setFindingMatches}) => {
  const {queryTemplateParams} = useAppSelector(state => state.main.search);
  const dispatch = useAppDispatch();

  const toggleMatchParam = (param: keyof MatchParamProps) => {
    setFindingMatches(true);
    dispatch(toggleMatchParams(param));
  };

  return (
    <>
      <S.StyledButton $isItemSelected={queryTemplateParams.matchCase} onClick={() => toggleMatchParam('matchCase')}>
        <FilterOutlined />
      </S.StyledButton>
    </>
  );
};

export default QueryTemplateParams;
