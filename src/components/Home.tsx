import React from 'react';

interface HomeProps {
  setClientType: (type: 'standard' | 'simple') => void;
}

const Home: React.FC<HomeProps> = ({ setClientType }) => {
  return (
    <div>
      <h1>Choose SIP Client</h1>
      <button onClick={() => setClientType('standard')}>Standard SIP Client</button>
      <button onClick={() => setClientType('simple')}>SimpleUser SIP Client</button>
    </div>
  );
};

export default Home;