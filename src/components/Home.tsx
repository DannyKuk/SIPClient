import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface HomeProps {
  setClientType: (type: 'standard' | 'simple' | 'simpleresponsive') => void;
}

const Home: React.FC<HomeProps> = ({ setClientType }) => {
  return (
    <div>
      <h1>Choose SIP Client</h1>
      <Stack direction="row" spacing={5} alignItems="center" justifyContent="center">
        <Button variant='outlined' onClick={() => setClientType('standard')}>Standard SIP Client</Button>
        <Button variant='outlined' onClick={() => setClientType('simple')}>SimpleUser SIP Client</Button>
      </Stack>
      <Button variant='outlined' onClick={() => setClientType('simpleresponsive')}>{"SimpleUser SIP Client (Responsive | Experimental)"}</Button>
    </div>
  );
};

export default Home;