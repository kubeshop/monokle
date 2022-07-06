enum Colors {
  // Greys
  grey4000 = '#1F1F1F',
  grey3000 = '#191F21',
  grey2000 = '#081A20',
  grey1000 = '#141414',
  grey900 = '#3A4344',
  grey800 = '#7B8185',
  grey700 = '#93989C',
  grey500 = '#C5C8CB',
  grey400 = '#DBE0DE',
  grey200 = '#F3F5F4',
  grey100 = '#F9FAFA',
  grey11 = '#101314',
  grey10 = '#191F21',
  grey9 = '#DBDBDB', // gray, grey 9
  grey8 = '#ACACAC', // gray, gray 8
  grey7 = '#7D7D7D', // gray, gray 7 https://www.figma.com/file/3UVW3KVNob7QjgvH62blGU/add-left-and-right-toolbars?node-id=3%3A5926
  grey6 = '#5A5A5A', // gray, gray 6
  grey5b = '#434343', // gray, gray 5 as in Figma - FIXME!
  greyXY = '#31393c80', // Missing color - FIXME!
  grey4 = '#303030', // gray, gray 4
  grey3b = '#293235',
  grey3 = '#262626', // gray, gray 3
  grey1 = '#141414', // gray, gray 1

  // Notifications
  greenOkay = '#09b89d',
  polarGreen = '#6ABE39',
  greenOkayCompliment = '#B2DFD3',
  okayBg = '#6ABE3933',

  yellowWarning = '#ffe17f',
  yellowWarningCompliment = '#FFF3CA',
  yellow5 = '#F3CC62',
  yellow6 = '#D8BD14',
  yellow7 = '#E8D639',
  yellow8 = '#F3EA62',
  yellow10 = '#FAFAB5',
  yellow11 = '#C9E75D',

  redError = '#e65a6d',
  redErrorCompliment = '#F4BAB8',
  red7 = '#E84749', // Dust Red
  red6 = '#D32029',
  errorBg = '#E84749',

  whitePure = '#ffffff',
  blackPure = '#000000',
  blackPearl = '#111d2c',
  black9 = '#0C0D0E',

  cyan = '#58D1C9',
  cyan7 = '#33BCB7',
  cyan5 = '#138585',
  volcano = '#F3956A',
  lightSeaGreen = '#13a8a8',
  blue6 = '#1890FF', // Daybreak Blue
  blue7 = '#177DDC', // Daybreak Blue
  blue10 = '#B7E3FA',
  geekblue4 = '#203175',

  green7 = '#6ABE39', // Polar Green
  green10 = '#3E4F13', // Dark Green

  highlightGreen = '#33BCB7',

  selectionGradient = 'linear-gradient(90deg, #3C9AE8 0%, #84E2D8 100%)',
  selectionGradientHover = 'linear-gradient(90deg, #3C9AE8 50%, #84E2D8 100%)',
  highlightGradient = 'linear-gradient(90deg, #113536 0%, #000000 100%)',
  highlightGradientHover = 'linear-gradient(90deg, #113536 50%, #000000 100%)',
  diffBackground = '#2B2611',
  diffBackgroundHover = '#27220f',
}

export enum PanelColors {
  toolBar = Colors.grey10,
  headerBar = Colors.grey11,
}

export enum BackgroundColors {
  lightThemeBackground = Colors.whitePure,
  darkThemeBackground = Colors.blackPure,
  previewModeBackground = Colors.cyan,
  clusterModeBackground = Colors.volcano,
}

export enum FontColors {
  lightThemeMainFont = Colors.blackPure,
  darkThemeMainFont = Colors.grey9,
  elementSelectTitle = Colors.blue6,
  resourceRowHighlight = Colors.highlightGreen,
  grey = Colors.grey700,
  error = Colors.redError,
  afford = Colors.greenOkay,
  warning = Colors.yellowWarning,
}

export default Colors;
