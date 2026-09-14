import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRoot from './AppRoot';
import ErrorBoundary from './components/ErrorBoundary';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <AppRoot />
            </ErrorBoundary>
        </React.StrictMode>
    );
}
