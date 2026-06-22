import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArticles } from '../../services/api';

const FlashNews = () => {
  const { data: articlesData, refetch } = useQuery({
    queryKey: ['flash-news-articles'],
    queryFn: () => getArticles({ limit: 6 }),
  });

  useEffect(() => {
    const handleDbChange = () => {
      refetch();
    };
    window.addEventListener('tolly_db_change', handleDbChange);
    return () => window.removeEventListener('tolly_db_change', handleDbChange);
  }, [refetch]);

  const defaultItems = [
    "Peddi crosses ₹320 Cr worldwide in 2 weeks",
    "Drishyam 3 streaming on Amazon Prime Video",
    "Nagabandham trailer at Prasads PCX June 19",
    "Dhurandhar unedited on Netflix from June 19"
  ];

  const articles = articlesData?.data || [];
  const tickerItems = articles.length > 0 
    ? articles.map(a => a.title)
    : defaultItems;

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
