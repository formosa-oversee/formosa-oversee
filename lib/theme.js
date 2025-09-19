import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6e6',
      100: '#c6e9c6',
      200: '#a5dba5',
      300: '#83cd83',
      400: '#62c062',
      500: '#41b341',
      600: '#328932',
      700: '#236023',
      800: '#143614',
      900: '#051d05',
    },
  },
  fonts: {
    heading: '"Noto Sans TC", sans-serif',
    body: '"Noto Sans TC", sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
      },
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
      },
    },
  },
});

export default theme; 