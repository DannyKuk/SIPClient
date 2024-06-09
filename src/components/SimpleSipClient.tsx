import React, { useState, useRef } from 'react';
import { SimpleUser, SimpleUserOptions } from 'sip.js/lib/platform/web';
import { InviterOptions } from 'sip.js';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';

interface SimpleSipClientProps {
  onBack: () => void;
}

const SimpleSipClient: React.FC<SimpleSipClientProps> = ({ onBack }) => {
  const [userAgent, setUserAgent] = useState<SimpleUser | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  const [sipServer, setSipServer] = useState('');
  const [webSocketServer, setWebSocketServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [target, setTarget] = useState('');

  const [open, setOpen] = React.useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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
    const uri = `sip:${username}@${sipServer}`;
    const webSocketServerUrl = `wss://${webSocketServer}`;

    const options: SimpleUserOptions = {
      aor: uri,
      media: {
        constraints: { audio: true, video: true },
        local: {
          video: localVideoRef.current ?? undefined,
        },
        remote: {
          video: remoteVideoRef.current ?? undefined,
        },
      },
      userAgentOptions: {
        authorizationUsername: username,
        authorizationPassword: password,
        transportOptions: {
          server: webSocketServerUrl,
        },
        sessionDescriptionHandlerFactoryOptions: {
          peerConnectionConfiguration: {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          }
        }
      },
    };

    const simpleUser = new SimpleUser(uri, options);

    simpleUser.delegate = {
      onRegistered: () => registration(true),
      onUnregistered: () => registration(false),
      onCallReceived: async () => {
        await simpleUser.answer();
        setIsInCall(true);
      },
      onCallHangup: () => setIsInCall(false),
      onCallAnswered: () => setIsInCall(true),
    };

    simpleUser.connect().then(() => simpleUser.register());

    setUserAgent(simpleUser);
  };

  const handleCall = (isVideoCall: boolean) => {
    if (userAgent) {
      const inviterOptions: InviterOptions = {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: isVideoCall }
        }
      };

      userAgent.call(`sip:${target}@${sipServer}`, inviterOptions);
      setIsInCall(true);
    }
  };

  const handleHangup = () => {
    if (userAgent) {
      userAgent.hangup();
      setIsInCall(false);
    }
  };

  const handleHold = () => {
    if (userAgent) {
      if (!isOnHold) {
        userAgent.hold();
        setIsOnHold(true);
      } else {
        userAgent.unhold();
        setIsOnHold(false);
      }
    }
  };

  return (
    <div>
      <h1 style={{color: '#8ecae6'}}>SimpleUser SIP Client</h1>
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
        <Button style={{width: '100px', margin: '5px'}} onClick={handleHold} disabled={!isInCall} variant='outlined' color='secondary'>Hold</Button>
        <Button style={{width: '100px', margin: '5px'}} onClick={handleHangup} disabled={!isInCall} variant='outlined' color='error'>Hang Up</Button>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={3}>
        <Button style={{width: '180px', margin: '10px'}} onClick={() => handleCall(false)} disabled={!isRegistered || !target} variant='contained' color='success'>Call (Audio)</Button>
        <Button style={{width: '180px', margin: '10px'}} onClick={() => handleCall(true)} disabled={!isRegistered || !target} variant='outlined' color='success'>Call (Video)</Button>
      </Stack>
      <Button style={{width: '150px', margin: '50px'}} onClick={onBack} disabled={isInCall} variant='outlined'>Back to Home</Button>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        message="Registered"
        onClose={handleClose}
      />
      <div>
        <video ref={localVideoRef} autoPlay playsInline />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
    </div>
  );
};

export default SimpleSipClient;