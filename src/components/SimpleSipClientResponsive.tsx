import React, { useState, useRef } from 'react';
import { SimpleUser, SimpleUserOptions } from 'sip.js/lib/platform/web';
import { InviterOptions } from 'sip.js';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PauseIcon from '@mui/icons-material/Pause';
import CallEndIcon from '@mui/icons-material/CallEnd';
import DialerSipIcon from '@mui/icons-material/DialerSip';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import Fab from '@mui/material/Fab';

interface SimpleSipClientResponsiveProps {
  onBack: () => void;
}

const SimpleSipClientResponsive: React.FC<SimpleSipClientResponsiveProps> = ({ onBack }) => {
  const [userAgent, setUserAgent] = useState<SimpleUser | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [isReceivingCall, setIsReceivingCall] = useState(false);

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
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            rtcpMuxPolicy: 'require',
            bundlePolicy: 'max-bundle',
            sdpSemantics: 'unified-plan',
          },
        },
      },
    };
  
    const simpleUser = new SimpleUser(uri, options);
  
    simpleUser.delegate = {
      onRegistered: () => {
        console.log('Registered successfully');
        registration(true);
      },
      onUnregistered: () => {
        console.log('Unregistered');
        registration(false);
      },
      onCallReceived: async () => {
        console.log('Call received');
        setIsReceivingCall(true);
      },
      onCallHangup: () => {
        console.log('Call hung up');
        setIsInCall(false);
      },
      onCallAnswered: () => {
        console.log('Call answered successfully');
        setIsInCall(true);
      },
      onMessageReceived: (message) => {
        console.log('Message received:', message);
        setMessages((prevMessages) => [...prevMessages, `Them: ${message}`]);
      },
    };
  
    simpleUser.connect().then(() => {
      console.log('Connected');
      return simpleUser.register();
    }).then(() => {
      console.log('Registered');
    }).catch(error => {
      console.error('Connection error:', error);
    });
  
    setUserAgent(simpleUser);
  };

  const handleCall = (isVideoCall: boolean) => {
    if (userAgent) {
      const inviterOptions: InviterOptions = {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: isVideoCall }
        }
      };

      userAgent.call(`sip:${target}`, inviterOptions);
      setIsInCall(true);
    }
  };

  const handleHangup = () => {
    if (userAgent) {
      userAgent.hangup();
      setIsInCall(false);
      setIsReceivingCall(false);
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

  const handleAccept = async () => {
    if (userAgent && isReceivingCall) {
        setIsReceivingCall(false);
        console.log('Call received');
        try {
          await userAgent.answer();
          console.log('Call answered');
          setIsInCall(true);
        } catch (error) {
          console.error('Error answering call:', error);
        }
    }
  };

  const handleSendMessage = () => {
    if (userAgent && target && message) {
      userAgent.message(`sip:${target}@${sipServer}`, message);
      setMessages((prevMessages) => [...prevMessages, `You: ${message}`]);
      setMessage('');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" align="center" sx={{ color: '#8ecae6', mb: 3 }}>{"SimpleUser SIP Client (Responsive | Experimental)"}</Typography>
      <Grid container spacing={2}>
        {isRegistered ? (
          <Grid item xs={12}>
            <Typography variant="body1" align="center">Registered as {username}</Typography>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Grid container spacing={2} direction="column">
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
      <Grid container spacing={2} direction="column">
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

        {isInCall ? (
          <Grid container spacing={3} direction={'row'} justifyContent={'center'}>
            <Grid item xs={6} sm={4}>
              <Fab color="secondary" aria-label="hold" onClick={handleHold} disabled={!isInCall}>
                <PauseIcon />
              </Fab>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Fab color="error" aria-label="hangup" onClick={handleHangup}>
                <CallEndIcon />
              </Fab>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3} direction={'row'} justifyContent={'center'}>
            <Grid item xs={6} sm={4}>
              <Fab color="success" aria-label="audicall" onClick={() => handleCall(false)}>
                <DialerSipIcon />
              </Fab>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Fab color="success" aria-label="videocall" onClick={() => handleCall(true)}>
                <VideoCallIcon />
              </Fab>
            </Grid>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2} direction="column" sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isRegistered}
            variant="standard"
            color="primary"
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            fullWidth
            color='primary'
            onClick={handleSendMessage}
            disabled={!isRegistered || !message}
            variant='outlined'
          >
            Send Message
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ maxHeight: '200px', overflowY: 'auto', mt: 2 }}>
            {messages.map((msg, index) => (
              <Typography key={index} variant="body2">{msg}</Typography>
            ))}
          </Box>
        </Grid>
      </Grid>

      {isReceivingCall ? (
        <Grid container spacing={3} direction={'column'} justifyContent={'center'}>
            <Grid item xs={6} sm={4}>
                Incoming Call
            </Grid>
            <Grid item xs={6} sm={4}>
                <Grid container spacing={3} direction={'row'} justifyContent={'center'}>
                    <Grid item xs={6} sm={4}>
                        <Fab color="success" aria-label="acceptIncoming" onClick={handleAccept}>
                            <DialerSipIcon />
                        </Fab>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <Fab color="error" aria-label="hangup" onClick={handleHangup}>
                            <CallEndIcon />
                        </Fab>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        
      ) : (
        <div>
        </div>
      )}

      <Grid container spacing={2} sx={{ mt: 4 }}>

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
