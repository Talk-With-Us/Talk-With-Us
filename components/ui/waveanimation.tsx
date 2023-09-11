import React from 'react';

const WaveAnimation = () => {
  return (
    <div className="waveWrapper waveAnimation">
      <div className="waveWrapperInner bgTop">
        <div className="wave waveTop" style={{ background: 'url("http://front-end-noobs.com/jecko/img/wave-top.png")' }}></div>
      </div>
      <div className="waveWrapperInner bgMiddle">
        <div className="wave waveMiddle" style={{ background: 'url("http://front-end-noobs.com/jecko/img/wave-mid.png")' }}></div>
      </div>
      <div className="waveWrapperInner bgBottom">
        <div className="wave waveBottom" style={{ background: 'url("http://front-end-noobs.com/jecko/img/wave-bot.png")' }}></div>
      </div>
    </div>
  );
};

export default WaveAnimation;
