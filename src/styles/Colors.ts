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
  grey8 = '#ACACAC', // gray, gray 8
  grey7 = '#7D7D7D', // gray, gray 7 https://www.figma.com/file/3UVW3KVNob7QjgvH62blGU/add-left-and-right-toolbars?node-id=3%3A5926
  grey4 = '#303030', // gray, gray 4
  grey3 = '#262626', // gray, gray 3

  // Notifications
  greenOkay = '#09b89d',
  greenOkayCompliment = '#B2DFD3',

  yellowWarning = '#ffe17f',
  yellowWarningCompliment = '#FFF3CA',
  yellow7 = '#E8D639',
  yellow10 = '#FAFAB5',

  redError = '#e65a6d',
  redErrorCompliment = '#F4BAB8',

  whitePure = '#ffffff',
  blackPure = '#000000',
  blackPearl = '#111d2c',

  cyan = '#58D1C9',
  cyan7 = '#33BCB7',
  volcano = '#F3956A',

  blue6 = '#1890FF', // Daybreak Blue
  blue10 = '#B7E3FA',

  red7 = '#E84748', // Dust Red

  highlightGreen = '#33BCB7',

  selectionGradient = 'linear-gradient(90deg, #3C9AE8 0%, #84E2D8 100%)',
  selectionGradientHover = 'linear-gradient(90deg, #3C9AE8 50%, #84E2D8 100%)',
  highlightGradient = 'linear-gradient(90deg, #113536 0%, #000000 100%)',
  highlightGradientHover = 'linear-gradient(90deg, #113536 50%, #000000 100%)',
  diffBackground = '#2B2611',
  diffBackgroundHover = '#27220f',
}

export enum BackgroundColors {
  lightThemeBackground = Colors.whitePure,
  darkThemeBackground = Colors.blackPure,
  previewModeBackground = Colors.cyan,
  clusterModeBackground = Colors.volcano,
}

export enum FontColors {
  lightThemeMainFont = Colors.blackPure,
  darkThemeMainFont = Colors.grey450,
  elementSelectTitle = Colors.blue6,
  resourceRowHighlight = Colors.highlightGreen,
  grey = Colors.grey700,
  error = Colors.redError,
  afford = Colors.greenOkay,
  warning = Colors.yellowWarning,
}

export default Colors;
