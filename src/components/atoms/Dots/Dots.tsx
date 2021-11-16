import styled from 'styled-components';

import Colors from '@styles/Colors';

const DotsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: inherit;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.color};

  &:not(:last-child) {
    margin-right: 2px;
  }
`;

interface DotsProps {
  dotNumber?: number;
  color?: Colors;
}

const Dots: React.FC<DotsProps> = props => {
  const {dotNumber = 3, color = Colors.blue6} = props;

  const dots = Array.from({length: dotNumber}).map(() => {
    return <Dot color={color} />;
  });

  return <DotsContainer>{dots}</DotsContainer>;
};

export default Dots;
