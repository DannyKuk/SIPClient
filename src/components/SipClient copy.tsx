import { Button, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';
import {
  UserAgent,
  UserAgentOptions,
  Inviter,
  Invitation,
  Registerer,
  RegistererState,
  URI
} from 'sip.js';

interface SipClientProps {
  onBack: () => void;
}

const SipClient: React.FC<SipClientProps> = ({ onBack }) => {
  const [userAgent, setUserAgent] = useState<UserAgent | null>(null);
  const [session, setSession] = useState<Inviter | Invitation | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const [sipServer, setSipServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [target, setTarget] = useState('');

  const handleRegister = () => {
    const uri = new URI('sip', username, sipServer);
    const userAgentOptions: UserAgentOptions = {
      uri,
      transportOptions: {
        server: `wss://${sipServer}/ws`
      },
      authorizationUsername: username,
      authorizationPassword: password,
    };

    const ua = new UserAgent(userAgentOptions);
    setUserAgent(ua);

    const registerer = new Registerer(ua);
    registerer.stateChange.addListener((state) => {
      if (state === RegistererState.Registered) {
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
    });

    ua.delegate = {
      onInvite: (invitation) => {
        setSession(invitation);
        invitation.accept();
      }
    };

    ua.start().then(() => {
      registerer.register();
    });
  };

  const handleCall = () => {
    if (userAgent) {
      const targetUri = new URI('sip', target, sipServer);
      const inviter = new Inviter(userAgent, targetUri, {
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false,
          },
        },
      });
      setSession(inviter);
      inviter.invite();
    }
  };

  const handleHangup = () => {
    if (session) {
      session.bye();
      setSession(null);
    }
  };

  return (
    <div>
      <h1 style={{color: '#8ecae6'}}>Standard SIP Client</h1>
      <div>
        {isRegistered ? (
          <p>Registered</p>
        ) : (
          <form>
            <div>
              <TextField id="standard-basic" label="SIP Server" onChange={(e) => setSipServer(e.target.value)} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
              {/*
              <label>
                SIP Server:
                <input type="text" value={sipServer} onChange={(e) => setSipServer(e.target.value)} />
              </label>
              */}
            </div>
            <div>
              <TextField id="standard-basic" label="Username" onChange={(e) => setUsername(e.target.value)} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
              {/*
              <label>
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
              */}
            </div>
            <div>
              <TextField id="standard-basic" label="Password" onChange={(e) => setPassword(e.target.value)} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
              {/*
              <label>
                Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              */}
            </div>
            <Button style={{width: '150px', margin: '50px'}} color='success' onClick={handleRegister} variant='outlined'>Register</Button>
            {/*
            <button type="button" onClick={handleRegister}>
              Register
            </button>
            */}
          </form>
        )}
      </div>
      <div>
        <TextField id="standard-basic" label="Target" onChange={(e) => setTarget(e.target.value)} disabled={!isRegistered} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
        {/*
        <label>
          Target:
          <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} disabled={!isRegistered} />
        </label>
        */}
      </div>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={3}>
          <Button style={{width: '180px', margin: '10px'}} onClick={() => handleCall} disabled={!isRegistered || !target} variant='contained' color='success'>Call (Audio)</Button>
          <Button style={{width: '180px', margin: '10px'}} onClick={() => handleHangup} disabled={!session} variant='outlined' color='error'>Hang Up</Button>
      </Stack>
      {/*
      <button onClick={handleCall} disabled={!isRegistered || !target}>
        Call
      </button>
      <button onClick={handleHangup} disabled={!session}>
        Hang Up
      </button>
      */}
      <div>
        <Button style={{width: '150px', margin: '50px'}} onClick={onBack} variant='outlined'>Back to Home</Button>
        {/*
        <button onClick={onBack}>Back to Home</button>
        */}
      </div>
    </div>
  );
};

export default SipClient;