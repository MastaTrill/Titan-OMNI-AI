import React, { useEffect } from 'react';

const BiometricHandshake = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="handshake-screen">
      <div className="center-orb">ASTRA</div>
      <div className="load-bar">
        <div className="fill fill-full" />
      </div>
      <div className="biometric-text">INITIALIZING_BIOMETRIC_HANDSHAKE...</div>
    </div>
  );
};

export default BiometricHandshake;
