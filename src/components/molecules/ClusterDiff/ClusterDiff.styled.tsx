import styled from 'styled-components';

export const Container = styled.div<{height?: number}>`
  ${props => props.height && `height: ${props.height};`}
`;

export const FilterContainer = styled.span`
  margin-left: 10px;
`;

export const List = styled.ol<{height?: number}>`
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  width: 100%;

  ${props => props.height && `height: ${props.height}px;`}
  padding-bottom: 20px;
`;

export const ListContainer = styled.div`
  overflow-y: auto;
  height: 70vh;
  width: 100%;
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  margin-left: 8px;
`;

export const TitleBarRightButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;
