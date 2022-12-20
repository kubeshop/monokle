import React, {useState} from 'react';

import './TemplateSidebarPreview.styled';
import * as S from './TemplateSidebarPreview.styled';

export const ReadMore = ({children}: any) => {
  const text = children;
  console.log(text, 'txt');
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore);
  };
  return (
    <S.ReadMoreStyled>
      {isReadMore ? text.slice(0, 122) : text}
      <S.Link onClick={toggleReadMore} className="read-or-hide">
        {isReadMore ? '...Learn more' : ' Learn less'}
      </S.Link>
    </S.ReadMoreStyled>
  );
};
