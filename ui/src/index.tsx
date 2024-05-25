import {StrictMode} from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import router from './router';
import * as Sentry from '@sentry/browser';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { orange, orange as blue } from '@mui/material/colors';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RouterProvider} from '@tanstack/react-router';
import {validateAuth} from "./api";
import {ConfirmProvider} from "material-ui-confirm";

const theme = createTheme({
  palette: {
    primary: import.meta.env.PROD ? orange : blue,
  },
});

Sentry.init({
 dsn: import.meta.env.SENTRY_DSN
});

validateAuth();

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 30
        }
    }
});

const container = document.getElementById('root');
if(!container) {
    throw new Error("Root container not found")
}
const root = createRoot(container);
root.render(
  <StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
    <ConfirmProvider>
    <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    </QueryClientProvider>
    </ConfirmProvider>
    </ThemeProvider>
  </StrictMode>
);

