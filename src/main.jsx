import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';

import App from '~/App.jsx';
import theme from '~/theme.js';

// Cấu hình react-toastify
import { ToastContainer } from 'react-toastify';
// Cấu hình MUI Dialog
import { ConfirmProvider } from 'material-ui-confirm';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <ConfirmProvider
        defaultOptions={{
          dialogProps: {
            maxWidth: 'xs',
          },
          allowClose: false,
          confirmationButtonProps: { color: 'primary', variant: 'outlined' },
          cancellationButtonProps: { color: 'primary' },
        }}
      >
        <CssBaseline />
        <App />
        <ToastContainer position="bottom-left" theme="colored" />
      </ConfirmProvider>
    </CssVarsProvider>
  </React.StrictMode>
);
