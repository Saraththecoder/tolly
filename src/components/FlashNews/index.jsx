import React from 'react';

const FlashNews = () => {
  const tickerItems = [
    "Peddi crosses ₹320 Cr worldwide in 2 weeks",
    "Drishyam 3 streaming on Amazon Prime Video",
    "Nagabandham trailer at Prasads PCX June 19",
    "Dhurandhar unedited on Netflix from June 19"
  ];

  return (
    <div className="topbar">
      <div className="tick-wrap">
        <div className="tlabel">LIVE</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="ticker-inner">
            {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
              <span key={index} className="ticker-item">
                {item} &nbsp;◆&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashNews;
