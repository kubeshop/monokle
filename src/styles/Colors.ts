enum Colors {
  // Greys
  grey900 = '#3A4344',
  grey800 = '#7B8185',
  grey700 = '#93989C',
  grey500 = '#C5C8CB',
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
};

export enum BackgroundColors {
  lightThemeBackground = Colors.whitePure,
  darkThemeBackground = Colors.blackPure,
};

export enum FontColors {
  lightThemeMainFont = Colors.blackPure,
  darkThemeMainFont = Colors.whitePure,
  grey = Colors.grey700,
  error = Colors.redError,
  afford = Colors.greenOkay,
  warning = Colors.yellowWarning,
};

export default Colors;
