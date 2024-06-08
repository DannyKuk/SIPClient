import React, { useState } from 'react';
import './App.css';
import Home from './Home';
import SipClient from './SipClient';
import SimpleSipClient from './SimpleSipClient';

const App: React.FC = () => {
  const [clientType, setClientType] = useState<'standard' | 'simple' | null>(null);

  const handleBack = () => {
    setClientType(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        {clientType === null && <Home setClientType={setClientType} />}
        {clientType === 'standard' && <SipClient onBack={handleBack} />}
        {clientType === 'simple' && <SimpleSipClient onBack={handleBack} />}
      </header>
    </div>
  );
};

export default App;