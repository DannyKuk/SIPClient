import React, { useState, useRef } from 'react';
import { SimpleUser, SimpleUserOptions } from 'sip.js/lib/platform/web';
import { InviterOptions } from 'sip.js';

interface SimpleSipClientProps {
  onBack: () => void;
}

const SimpleSipClient: React.FC<SimpleSipClientProps> = ({ onBack }) => {
  const [userAgent, setUserAgent] = useState<SimpleUser | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  const [sipServer, setSipServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [target, setTarget] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const handleRegister = () => {
    const uri = `sip:${username}@${sipServer}`;
    const webSocketServer = `wss://${sipServer}/ws`;

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
          server: webSocketServer,
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
      onRegistered: () => setIsRegistered(true),
      onUnregistered: () => setIsRegistered(false),
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
      <h1>SimpleUser SIP Client</h1>
      <div>
        {isRegistered ? (
          <p>Registered</p>
        ) : (
          <form>
            <div>
              <label>
                SIP Server:
                <input type="text" value={sipServer} onChange={(e) => setSipServer(e.target.value)} />
              </label>
            </div>
            <div>
              <label>
                Username:
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
            </div>
            <div>
              <label>
                Password:
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
            </div>
            <button type="button" onClick={handleRegister}>
              Register
            </button>
          </form>
        )}
      </div>
      <div>
        <label>
          Target:
          <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} disabled={!isRegistered} />
        </label>
      </div>
      <div>
        <button onClick={() => handleCall(false)} disabled={!isRegistered || !target}>
          Call (Audio)
        </button>
        <button onClick={() => handleCall(true)} disabled={!isRegistered || !target}>
          Call (Video)
        </button>
      </div>
      <div>
        <button onClick={handleHold} disabled={!isInCall}>
          Hold
        </button>
        <button onClick={handleHangup} disabled={!isInCall}>
          Hang Up
        </button>
      </div>
      <button onClick={onBack} disabled={isInCall}>Back to Home</button>
      <div>
        <video ref={localVideoRef} autoPlay playsInline />
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
    </div>
  );
};

export default SimpleSipClient;