enum Colors {
  // Greys
  grey1000 = '#141414',
  grey900 = '#3A4344',
  grey800 = '#7B8185',
  grey700 = '#93989C',
  grey500 = '#C5C8CB',
  grey450 = '#DBDBDB',
  grey400 = '#DBE0DE',
  grey200 = '#F3F5F4',
  grey100 = '#F9FAFA',

  // Notifications
  greenOkay = '#09b89d',
  greenOkayCompliment = '#B2DFD3',
  yellowWarning = '#ffe17f',
  yellowWarningCompliment = '#FFF3CA',
  redError = '#e65a6d',
  redErrorCompliment = '#F4BAB8',

  whitePure = '#ffffff',
  blackPure = '#000000',

  monoBlue = '#1890FF', // Daybreak Blue / blue-6
  highlightGreen = '#33BCB7',

  selectionGradient = 'linear-gradient(90deg, #3C9AE8 0%, #84E2D8 100%)',
  highlightGradient = 'linear-gradient(90deg, #113536 0%, #000000 100%)',
};

export enum BackgroundColors {
  lightThemeBackground = Colors.whitePure,
  darkThemeBackground = Colors.blackPure,
};

export enum FontColors {
  lightThemeMainFont = Colors.blackPure,
  darkThemeMainFont = Colors.grey450,
  elementSelectTitle = Colors.monoBlue,
  resourceRowHighlight = Colors.highlightGreen,
  grey = Colors.grey700,
  error = Colors.redError,
  afford = Colors.greenOkay,
  warning = Colors.yellowWarning,
};

export default Colors;
