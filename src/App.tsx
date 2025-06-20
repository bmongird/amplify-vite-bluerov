// App.tsx - Refactored BlueROV Dashboard
import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { BlueROVDashboard } from './components/dashboard/dashboard';
import { ErrorBoundary } from './components/errorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="app">
            <main className="app-main">
              <BlueROVDashboard />
            </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;