import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import React from 'react'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#00c0c0',
    },
    secondary: {
      main: '#4380f8',
    },
  },
  typography: {
    h2: {
      fontWeight: 'bold',
      fontSize: '1.3rem',
      color: '#444',
    },
  },
})

const MainTheme: React.FC = (props) => (
  <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
)

export { MainTheme }
