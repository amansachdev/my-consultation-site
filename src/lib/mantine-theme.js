import { createTheme } from '@mantine/core';

export const mantineTheme = createTheme({
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  colors: {
    brand: [
      '#f6f4ef',
      '#e8eee4',
      '#d4ddd0',
      '#b9c5b8',
      '#6b8a75',
      '#5a7865',
      '#4a6655',
      '#3e5748',
      '#2e4f43',
      '#243d33',
    ],
  },
  primaryColor: 'brand',
  defaultRadius: 'md',
  components: {
    Input: {
      styles: () => ({
        input: {
          backgroundColor: '#f6f7f3',
          borderColor: '#dfe3da',
          borderRadius: '0.375rem',
          minHeight: '3rem',
          fontSize: '1rem',
          transition: 'border-color 160ms ease, box-shadow 160ms ease',
          '&:focus, &:focus-within': {
            borderColor: '#6b8a75',
            boxShadow: '0 0 0 4px rgba(107, 138, 117, 0.15)',
          },
        },
      }),
    },
    TimePicker: {
      styles: () => ({
        input: {
          backgroundColor: '#f6f7f3',
          borderColor: '#dfe3da',
          borderRadius: '0.375rem',
          minHeight: '3rem',
        },
        fieldsGroup: {
          backgroundColor: 'transparent',
        },
        field: {
          backgroundColor: '#f6f7f3',
          color: '#20201d',
          border: 'none',
          textAlign: 'center',
          '&:focus': {
            backgroundColor: '#f6f7f3',
            color: '#20201d',
          },
        },
      }),
    },
  },
});
