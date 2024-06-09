import { Button, Snackbar, Stack, TextField } from '@mui/material';
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
  const [webSocketServer, setWebSocketServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [target, setTarget] = useState('');

  const [open, setOpen] = React.useState(false);

  const registration = (register: boolean) => {
    if (register) {
      setOpen(true);
      setIsRegistered(true);
    } else {
      setOpen(false);
      setIsRegistered(false);
    }
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleRegister = () => {
    const uri = new URI('sip', username, sipServer);
    const userAgentOptions: UserAgentOptions = {
      uri,
      transportOptions: {
        server: `wss://${webSocketServer}`
      },
      authorizationUsername: username,
      authorizationPassword: password,
    };

    const ua = new UserAgent(userAgentOptions);
    setUserAgent(ua);

    const registerer = new Registerer(ua);
    registerer.stateChange.addListener((state) => {
      if (state === RegistererState.Registered) {
        registration(true);
      } else {
        registration(false);
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
          <p>Registered as {username}</p>
        ) : (
          <form>
            <div>
              <TextField id="standard-basic" label="SIP Server" onChange={(e) => setSipServer(e.target.value)} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
            </div>
            <div>
              <TextField id="standard-basic" label="WebSocket Server" onChange={(e) => setWebSocketServer(e.target.value)} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
            </div>
            <div>
              <TextField id="standard-basic" label="Username" onChange={(e) => setUsername(e.target.value)} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
            </div>
            <div>
              <TextField id="standard-basic" label="Password" onChange={(e) => setPassword(e.target.value)} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
            </div>
            <Button style={{width: '150px', margin: '50px'}} color='success' onClick={handleRegister} variant='outlined'>Register</Button>
          </form>
        )}
      </div>
      <div>
        <TextField id="standard-basic" label="Target" onChange={(e) => setTarget(e.target.value)} disabled={!isRegistered} variant="standard" color="primary" style={{width: '400px', margin: '10px'}}/>
      </div>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={3}>
        <Button style={{width: '180px', margin: '10px'}} onClick={handleCall} disabled={!isRegistered || !target} variant='contained' color='success'>Call (Audio)</Button>
        <Button style={{width: '180px', margin: '10px'}} onClick={handleHangup} disabled={!session} variant='outlined' color='error'>Hang Up</Button>
      </Stack>
      <div>
        <Button style={{width: '150px', margin: '50px'}} onClick={onBack} variant='outlined'>Back to Home</Button>
      </div>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        message="Registered"
        onClose={handleClose}
      />
    </div>
  );
};

export default SipClient;