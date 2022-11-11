import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleMatchParams} from '@redux/reducers/main';

import {MatchParamProps} from '@monokle-desktop/shared/models';

import * as S from './styled';

type Props = {
  setFindingMatches: (flag: boolean) => void;
};

const QueryMatchParams: React.FC<Props> = ({setFindingMatches}) => {
  const {queryMatchParams} = useAppSelector(state => state.main.search);
  const dispatch = useAppDispatch();

  const toggleMatchParam = (param: keyof MatchParamProps) => {
    setFindingMatches(true);
    dispatch(toggleMatchParams(param));
  };

  return (
    <>
      <S.StyledButton $isItemSelected={queryMatchParams.matchCase} onClick={() => toggleMatchParam('matchCase')}>
        Aa
      </S.StyledButton>
      <S.StyledButton
        $isItemSelected={queryMatchParams.matchWholeWord}
        onClick={() => toggleMatchParam('matchWholeWord')}
      >
        [
      </S.StyledButton>
      <S.StyledButton $isItemSelected={queryMatchParams.regExp} onClick={() => toggleMatchParam('regExp')}>
        .*
      </S.StyledButton>
    </>
  );
};

export default QueryMatchParams;
