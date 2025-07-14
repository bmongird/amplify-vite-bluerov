// App.tsx - Refactored BlueROV Dashboard
import React from 'react';
import '@aws-amplify/ui-react/styles.css';
// import { fetchAuthSession } from 'aws-amplify/auth';

import { BlueROVDashboard } from './components/dashboard/dashboard';

const App: React.FC = () => {
  // fetchAuthSession().then((info) => {
  //   const cognitoIdentityId = info.identityId;
  //   console.log(cognitoIdentityId)
  // });
  return (
      <div className="app">
            <main className="app-main">
              <BlueROVDashboard />
            </main>
      </div>
  );
};

export default App;