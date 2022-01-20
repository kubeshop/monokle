import Colors from '@styles/Colors';

export const GlobalScrollbarStyle = `
  ::-webkit-scrollbar {
    width: 8px !important;
  }

  ::-webkit-scrollbar-track {
    background: ${Colors.grey1000} !important;
  }

  ::-webkit-scrollbar-thumb {
    background: ${Colors.grey4} !important;
  }
`;
