import { extendTheme } from '@chakra-ui/react';
import { colorsOptions } from './colors';


const customCss = {
    
    '& ::-webkit-scrollbar': {
      width: '8px',
    },
    '& ::-webkit-scrollbar-track': {
      background: 'var(--chakra-colors-darkMode-bg)',
    },
    '& ::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--chakra-colors-primary-dark)',
      borderRadius: '4px',
    },
    '& ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'var(--chakra-colors-primary-light)',
    },
    
    '& p, & span, & h1, & h2, & h3, & h4, & h5, & h6': {
      color: 'var(--chakra-colors-text-primary)',
      fontFamily: 'var(--chakra-fonts-body)',
      fontWeight: 'normal',
      fontSize: 'var(--chakra-fontSizes-md)',
      letterSpacing: '0.3px',
    },
    '& h1, & h2, & h3, & h4, & h5, & h6, & button': {
      fontFamily: 'var(--chakra-fonts-heading)',
      fontWeight: 'medium',
      fontSize: 'var(--chakra-fontSizes-2xl)',
      letterSpacing: '0.5px',
    },
    '& h2': {
      marginBottom: '0.5em',
    },
    
    '& *': {
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--chakra-colors-primary-dark) var(--chakra-colors-darkMode-bg)',
    },
};

const baseTheme = {
  styles: {
    global: {
      ...customCss,
    },
  },
};

function createTheme(colors) {
  return extendTheme({
    ...baseTheme,
    colors: {
      ...colors,
    },
  });
}


export const purpleNormalTheme = createTheme(colorsOptions.purpleNormal);
export const purpleLightTheme = createTheme(colorsOptions.purpleLight);
export const purpleDarkTheme = createTheme(colorsOptions.purpleDark);

export const blueNormalTheme = createTheme(colorsOptions.blueNormal);
export const blueLightTheme = createTheme(colorsOptions.blueLight);
export const blueDarkTheme = createTheme(colorsOptions.blueDark);

export const greenNormalTheme = createTheme(colorsOptions.greenNormal);
export const greenLightTheme = createTheme(colorsOptions.greenLight);
export const greenDarkTheme = createTheme(colorsOptions.greenDark);

export const orangeNormalTheme = createTheme(colorsOptions.orangeNormal);
export const orangeLightTheme = createTheme(colorsOptions.orangeLight);
export const orangeDarkTheme = createTheme(colorsOptions.orangeDark);

export const tealNormalTheme = createTheme(colorsOptions.tealNormal);
export const tealLightTheme = createTheme(colorsOptions.tealLight);
export const tealDarkTheme = createTheme(colorsOptions.tealDark);

export const pinkNormalTheme = createTheme(colorsOptions.pinkNormal);
export const pinkLightTheme = createTheme(colorsOptions.pinkLight);
export const pinkDarkTheme = createTheme(colorsOptions.pinkDark);

export const yellowNormalTheme = createTheme(colorsOptions.yellowNormal);
export const yellowLightTheme = createTheme(colorsOptions.yellowLight);
export const yellowDarkTheme = createTheme(colorsOptions.yellowDark);

export const themeOptions = {
  purpleNormal: purpleNormalTheme,
  purpleLight: purpleLightTheme,
  purpleDark: purpleDarkTheme,
  blueNormal: blueNormalTheme,
  blueLight: blueLightTheme,
  blueDark: blueDarkTheme,
  greenNormal: greenNormalTheme,
  greenLight: greenLightTheme,
  greenDark: greenDarkTheme,
  orangeNormal: orangeNormalTheme,
  orangeLight: orangeLightTheme,
  orangeDark: orangeDarkTheme,
  tealNormal: tealNormalTheme,
  tealLight: tealLightTheme,
  tealDark: tealDarkTheme,
  pinkNormal: pinkNormalTheme,
  pinkLight: pinkLightTheme,
  pinkDark: pinkDarkTheme,
  yellowNormal: yellowNormalTheme,
  yellowLight: yellowLightTheme,
  yellowDark: yellowDarkTheme
};

export default purpleNormalTheme;
