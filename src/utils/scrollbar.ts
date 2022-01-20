import Colors from '@styles/Colors';

export const GlobalScrollbarStyle = `
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${Colors.grey1000};
  }

  ::-webkit-scrollbar-thumb {
    background: ${Colors.grey4};
  }
`;
