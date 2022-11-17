import * as S from './Dashboard.styled';
import {Overview} from './Overview/Overview';
import {Tableview} from './Tableview/Tableview';

export const Dashboard = () => {
  return (
    <S.Container>
      <S.Header />
      <S.Content>
        <Overview />
        <Tableview />
      </S.Content>
    </S.Container>
  );
};
