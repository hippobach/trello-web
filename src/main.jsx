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
// Cấu hình redux store
import { store } from '~/redux/store';
import { Provider } from 'react-redux';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
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
  </Provider>
);
