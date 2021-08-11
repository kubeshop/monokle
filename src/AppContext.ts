import React from 'react';

const AppContext = React.createContext({
  windowSize: {
    height: 0,
    width: 0,
  },
});

export default AppContext;
