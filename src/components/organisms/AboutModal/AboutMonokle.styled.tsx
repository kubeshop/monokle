import styled from 'styled-components';

export const StyledContentContainerDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
`;

export const StyledContentDiv = styled.div`
  padding: 12px 24px;

  img {
    padding: 30px 0;
  }
`;

export const HeightFillDiv = styled.div`
  display: block;
  height: 440px;
`;

export const StyledTextContainer = styled.div`
  overflow: hidden;
  .ant-typography {
    display: block;
  }
`;
