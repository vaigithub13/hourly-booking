import './../src/global.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import * as serviceWorker from './serviceWorker'
import App from './app/App'

// third party style
import 'perfect-scrollbar/css/perfect-scrollbar.css'
//All Context
import { AuthProvider } from 'app/contexts/JWTAuthContext'
import SettingsProvider from 'app/contexts/SettingsContext'
//Matx Theme
import { MatxTheme } from 'app/components'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { CssBaseline } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import { DataProvider } from 'app/contexts/DataContext'

const root = createRoot(document.getElementById('root'))

root.render(
  <BrowserRouter>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
        <DataProvider>
          <SettingsProvider>
            <MatxTheme>
              <CssBaseline />
              <App />
              <ToastContainer autoClose={2000} theme="dark" />
            </MatxTheme>
          </SettingsProvider>
        </DataProvider>
      </AuthProvider>
    </LocalizationProvider>
  </BrowserRouter>,
)

// for IE-11 support un-comment cssVars() and it's import in this file
// and in MatxTheme file

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
