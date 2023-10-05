export enum Colors {
  // Greys
  grey5000 = '#2A385A',
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
  grey5 = '#434343', // gray, gray 5 as in Figma - FIXME!
  greyXY = '#31393c80', // Missing color - FIXME!
  grey4 = '#303030', // gray, gray 4
  grey3b = '#293235',
  grey3 = '#262626', // gray, gray 3
  grey2 = '#1D1D1D',
  grey1 = '#141414', // gray, gray 1

  coldGrey = '#31393C',
  warmGrey = '#222222',

  // Notifications
  greenOkay = '#09b89d',
  polarGreen = '#6ABE39',
  greenOkayCompliment = '#B2DFD3',
  okayBg = '#6ABE3933',

  yellowWarning = '#E8B339',
  yellowWarningCompliment = '#FFF3CA',
  yellow5 = '#F3CC62',
  yellow6 = '#D8BD14',
  yellow7 = '#E8D639',
  yellow8 = '#F3EA62',
  yellow10 = '#FAFAB5',
  yellow11 = '#C9E75D',
  yellow12 = '#E8B339',
  yellow100 = '#594214',
  yellow1000 = '#2B2111',

  volcano6 = '#D84A1B',
  volcano7 = '#E87040',
  volcano8 = '#F3956A',

  magenta7 = '#E0529C',
  magenta8 = '#F37FB7',

  redError = '#E84749',
  redErrorCompliment = '#F4BAB8',
  red3 = '#58181c',
  red4 = '#791A1F',
  red5 = '#a61d24',
  red6 = '#D32029',
  red7 = '#E84749', // Dust Red
  red10 = '#58181C',
  red100 = '#2A1215',
  errorBg = '#E84749',

  whitePure = '#ffffff',
  blackPure = '#000000',
  blackPearl = '#111d2c',
  black9 = '#0C0D0E',
  black10 = '#131629',
  black100 = '#0a0d0e',

  lime8 = '#C9E75D',

  purple8 = '#AB7AE0',

  cyan = '#58D1C9',
  cyan1 = '#112123',
  cyan2 = '#113536',
  cyan3 = '#1A4C4A',
  cyan4 = '#2D7877',
  cyan5 = '#138585',
  cyan6 = '#13A8A8',
  cyan7 = '#33BCB7',
  cyan8 = '#58D1C9',
  cyan9 = '#84E2D8',
  lightSeaGreen = '#13a8a8',

  blue1 = '#111D2C',
  blue6 = '#1890FF', // Daybreak Blue
  blue7 = '#177DDC', // Daybreak Blue
  blue8 = '#65B7F3',
  blue9 = '#8DCFF8',
  blue10 = '#B7E3FA',
  blue11 = '#164c7e',
  geekblue4 = '#203175',
  geekblue6 = '#2B4ACB',
  geekblue7 = '#5273E0',
  geekblue8 = '#7F9EF3',
  geekblue9 = '#A8C1F8',
  blue1000 = '#7F9EF3',

  green5 = '#3c8618',
  green6 = '#49AA19',
  green7 = '#6ABE39', // Polar Green
  green8 = '#8fd460',
  green9 = '#b2e58b',
  green10 = '#3E4F13', // Dark Green
  green100 = '#274916',
  green200 = '#162312',

  highlightGreen = '#33BCB7',

  selectionColor = blue9,
  selectionColorHover = blue8,
  highlightColor = cyan2,
  highlightColorHover = cyan3,
  diffBackground = '#2B2611',
  diffBackgroundHover = '#27220f',
  blueBgColor = '#202C4D',
  blueWrapperColor = '#2b3759',
  dryRun = cyan6,
  dryRunHover = cyan7,
}

export enum PanelColors {
  toolBar = Colors.grey10,
  headerBar = Colors.grey11,
}

export enum BackgroundColors {
  lightThemeBackground = Colors.whitePure,
  darkThemeBackground = Colors.black100,
  previewModeBackground = Colors.cyan,
  clusterModeBackground = Colors.volcano8,
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
