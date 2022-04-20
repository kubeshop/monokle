import {Card} from 'antd';

import * as S from './ValidationCardUpnext.styled';

const LET_US_KNOW_URL = 'https://github.com/open-policy-agent/opa';

export function ValidationCardUpnext() {
  return (
    <Card
      style={{backgroundColor: '#191F21', height: '100%', border: '2px dashed #31393B', borderRadius: '2px'}}
      bodyStyle={{borderRadius: '2px'}}
    >
      <S.Icon />
      <S.Name>New tools coming up soon!</S.Name>
      <span>
        <S.Link href={LET_US_KNOW_URL}>Let us know your favorites</S.Link>
      </span>
    </Card>
  );
}
