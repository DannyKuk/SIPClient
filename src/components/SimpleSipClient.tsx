import React, { useState } from 'react';
import { SimpleUser, SimpleUserOptions } from 'sip.js/lib/platform/web';

interface SimpleSipClientProps {
  onBack: () => void;
}

const SimpleSipClient: React.FC<SimpleSipClientProps> = ({ onBack }) => {
  const [userAgent, setUserAgent] = useState<SimpleUser | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  const [sipServer, setSipServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [target, setTarget] = useState('');

  const handleRegister = () => {
    const uri = `sip:${username}@${sipServer}`;
    const webSocketServer = `wss://${sipServer}/ws`;

    const options: SimpleUserOptions = {
      aor: uri,
      media: {
        constraints: { audio: true, video: false },
        remote: {
          audio: document.getElementById('remoteAudio') as HTMLAudioElement,
        }
      },
      userAgentOptions: {
        authorizationUsername: username,
        authorizationPassword: password,
        transportOptions: {
          server: webSocketServer,
        },
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
      onCallAnswered: () => setIsInCall(true)
    };

    simpleUser.connect().then(() => simpleUser.register());

    setUserAgent(simpleUser);
  };

  const handleCall = () => {
    if (userAgent) {
      userAgent.call(`sip:${target}@${sipServer}`);
      setIsInCall(true);
    }
  };

  const handleHangup = () => {
    if (userAgent) {
      userAgent.hangup();
      setIsInCall(false);
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
      <button onClick={handleCall} disabled={!isRegistered || !target}>
        Call
      </button>
      <button onClick={handleHangup} disabled={!isInCall}>
        Hang Up
      </button>
      <button onClick={onBack}>Back to Home</button>
      <audio id="remoteAudio" />
    </div>
  );
};

export default SimpleSipClient;