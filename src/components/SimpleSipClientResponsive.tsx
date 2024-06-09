import React, { useState, useRef } from 'react';
import { SimpleUser, SimpleUserOptions } from 'sip.js/lib/platform/web';
import { InviterOptions } from 'sip.js';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SimpleSipClientResponsiveProps {
  onBack: () => void;
}

const SimpleSipClientResponsive: React.FC<SimpleSipClientResponsiveProps> = ({ onBack }) => {
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
    const webSocketServerUrl = `wss://${webSocketServer}/ws`;

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
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" align="center" sx={{ color: '#8ecae6', mb: 3 }}>{"SimpleUser SIP Client (Respnsoive | Experimental)"}</Typography>
      <Grid container spacing={2}>
        {isRegistered ? (
          <Grid item xs={12}>
            <Typography variant="body1" align="center">Registered as {username}</Typography>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="SIP Server"
                  onChange={(e) => setSipServer(e.target.value)}
                  variant="standard"
                  color="primary"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="WebSocket Server"
                  onChange={(e) => setWebSocketServer(e.target.value)}
                  variant="standard"
                  color="primary"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Username"
                  onChange={(e) => setUsername(e.target.value)}
                  variant="standard"
                  color="primary"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  variant="standard"
                  color="primary"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  color='success'
                  onClick={handleRegister}
                  variant='outlined'
                  sx={{ mb: 4 }}
                >
                  Register
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Target"
            onChange={(e) => setTarget(e.target.value)}
            disabled={!isRegistered}
            variant="standard"
            color="primary"
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Button
            fullWidth
            onClick={handleHold}
            disabled={!isInCall}
            variant='outlined'
            color='secondary'
          >
            Hold
          </Button>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Button
            fullWidth
            onClick={handleHangup}
            disabled={!isInCall}
            variant='outlined'
            color='error'
          >
            Hang Up
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <Button
            fullWidth
            onClick={() => handleCall(false)}
            disabled={!isRegistered || !target}
            variant='contained'
            color='success'
          >
            Call (Audio)
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            onClick={() => handleCall(true)}
            disabled={!isRegistered || !target}
            variant='outlined'
            color='success'
          >
            Call (Video)
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Button
            fullWidth
            onClick={onBack}
            disabled={isInCall}
            variant='outlined'
          >
            Back to Home
          </Button>
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        message="Registered"
        onClose={handleClose}
      />
      <Box sx={{ mt: 4 }}>
        <video ref={localVideoRef} autoPlay playsInline style={{ width: '100%', marginBottom: '16px' }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%' }} />
      </Box>
    </Box>
  );
};

export default SimpleSipClientResponsive;