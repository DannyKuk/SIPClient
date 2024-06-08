import React, { useState } from 'react';
import './App.css';
import Home from './components/Home';
import SipClient from './components/SipClient';
import SimpleSipClient from './components/SimpleSipClient';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const App: React.FC = () => {
  const [clientType, setClientType] = useState<'standard' | 'simple' | null>(null);

  const handleBack = () => {
    setClientType(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          {clientType === null && <Home setClientType={setClientType} />}
          {clientType === 'standard' && <SipClient onBack={handleBack} />}
          {clientType === 'simple' && <SimpleSipClient onBack={handleBack} />}
        </header>
      </div>
    </ThemeProvider>
  );
};

export default App;