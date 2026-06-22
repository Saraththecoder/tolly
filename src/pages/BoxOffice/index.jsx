import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getBoxOffice, getUpcomingSchedules } from '../../services/api';

const BoxOffice = () => {
  const { data: boxOfficeData, isLoading } = useQuery({
    queryKey: ['all-box-office'],
    queryFn: getBoxOffice,
  });

  const { data: upcomingSchedules, refetch: refetchSchedules } = useQuery({
    queryKey: ['boxoffice-schedules'],
    queryFn: getUpcomingSchedules,
  });

  useEffect(() => {
    const handleDbChange = () => {
      refetchSchedules();
    };
    window.addEventListener('tolly_db_change', handleDbChange);
    return () => window.removeEventListener('tolly_db_change', handleDbChange);
  }, [refetchSchedules]);

  const getDaysRemainingText = (dateStr, status) => {
    if (status === 'TBA' || !dateStr) return 'TBA';
    const release = new Date(dateStr);
    if (isNaN(release.getTime())) return status || '2026';
    const now = new Date();
    release.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffTime = release - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays < 0) return 'Released';
    return `${diffDays} Days`;
  };

  const [activeFilter, setActiveFilter] = useState('🔴 Running Now');

  const filters = [
    '🔴 Running Now',
    'All Telugu',
    'All Hindi',
    'All Tamil',
    'OTT Releases',
    'Closed Films',
    'All Time Records'
  ];

  const getVerdictClass = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'blockbuster':
        return 'verdict v-blockbuster';
      case 'hit':
        return 'verdict v-hit';
      case 'flop':
        return 'verdict v-flop';
      case 'new':
      case 'running':
      default:
        return 'verdict v-running';
    }
  };

  const getTrendClass = (trend) => {
    if (trend?.includes('▲')) return 'trend-up';
    return 'trend-dn';
  };

  return (
    <div className="wrap">
      <Helmet>
        <title>Live Box Office Tracking | CHITRAMBHALARE</title>
        <meta name="description" content="Real-time worldwide & AP/TS collections for all running Telugu, Tamil & Hindi films." />
      </Helmet>

      {/* PAGE HERO */}
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-hero-left">
            <div className="page-eyebrow">
              <div className="live-dot"></div>
              Box Office Portal · Live Tracking
            </div>
            <div className="page-title">Live Box Office<br />Tracking</div>
            <div className="page-subtitle">Real-time worldwide &amp; AP/TS collections for all running Telugu, Tamil &amp; Hindi films.</div>
            <div className="last-updated">Last updated: <span>June 18, 2026 · 11:45 PM IST</span> &nbsp;🔄</div>
          </div>
          <div className="hero-stats">
            <div className="hstat"><div className="hstat-val">8</div><div className="hstat-lbl">Live Films</div></div>
            <div className="hstat"><div className="hstat-val">₹720Cr</div><div className="hstat-lbl">WW Total</div></div>
            <div className="hstat"><div className="hstat-val">Daily</div><div className="hstat-lbl">Updates</div></div>
            <div className="hstat"><div className="hstat-val">3</div><div className="hstat-lbl">New This Week</div></div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="filter-scroll">
        <div className="filter-tabs">
          {filters.map((tab) => (
            <button
              key={tab}
              className={`ftab ${tab.includes('Running') ? 'live-tab' : ''} ${activeFilter === tab ? 'on' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="main-layout">
        {/* LEFT CONTENT */}
        <div style={{ minWidth: 0 }}>
          {isLoading ? (
            <div style={{ color: 'var(--muted)', padding: '50px 0', textAlign: 'center' }}>
              Loading Box Office Collections...
            </div>
          ) : (
            <>
              {/* RUNNING NOW CARDS */}
              <div className="sec-hdr">
                <div className="sec-title">Running Now</div>
                <span className="sec-badge">🔴 8 Films Live</span>
              </div>
              <div className="live-scroll">
                <div className="live-row">
                  {boxOfficeData?.map((film) => {
                    const isNew = film.verdict === 'New';
                    const isHot = film.verdict === 'Blockbuster';
                    return (
                      <Link to={`/box-office`} key={film.id} className={`live-card ${isHot ? 'hot' : ''}`}>
                        <div className="lc-indicator">
                          <div className={`lc-dot ${isNew ? 'green' : ''}`}></div>
                          <span className={isNew ? 'lc-label-new' : 'lc-label-live'}>
                            {isNew ? 'New' : 'Live'}
                          </span>
                        </div>
                        <div className="lc-movie">{film.movieName}</div>
                        <div className="lc-dir">{film.cast}</div>
                        <div className="lc-amount">{film.worldwideGross}</div>
                        <div className="lc-amt-lbl">Worldwide Gross</div>
                        <div className="lc-days">Day {film.days} · {film.languages}</div>
                        <div className="lc-bar-wrap">
                          <div className={`lc-bar ${isHot ? 'red' : ''}`} style={{ width: `${film.percentage}%` }}></div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* DETAILED TABLE */}
              <div className="sec-hdr">
                <div className="sec-title">Detailed Collections</div>
                <span className="sec-link">Full Portal →</span>
              </div>
              <div className="track-table-wrap">
                <div className="track-table-hdr">
                  <div className="track-table-hdr-title">Telugu & major regional films — Running Collections</div>
                  <div className="track-table-hdr-sub">Updated June 18, 2026</div>
                </div>
                <div className="tbl-scroll">
                  <table className="track-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}># &nbsp;Film</th>
                        <th>WW Gross</th>
                        <th>Tel. Share</th>
                        <th>Days</th>
                        <th>Verdict</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boxOfficeData?.map((film, idx) => (
                        <tr key={film.id}>
                          <td>
                            <span className="t-rank">{idx + 1}</span>
                            <div className="t-movie">
                              {film.movieName}
                              <div className="t-sub">{film.director}</div>
                            </div>
                          </td>
                          <td><span className="t-amt">{film.worldwideGross}</span></td>
                          <td><span className="t-share">{film.indiaNet}</span></td>
                          <td><span className="t-days">{film.days}</span></td>
                          <td><span className={getVerdictClass(film.verdict)}>{film.verdict}</span></td>
                          <td><span className={getTrendClass(film.trend)}>{film.trend}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="legend">
                  <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--gold)' }}></div>Blockbuster</div>
                  <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--green)' }}></div>Hit</div>
                  <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--muted)' }}></div>Average / Running</div>
                  <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--crimson)' }}></div>Flop</div>
                </div>
              </div>
            </>
          )}

          {/* ALL TIME RECORDS */}
          <div className="sec-hdr">
            <div className="sec-title">All Time WW Records</div>
            <span className="sec-link">Full List →</span>
          </div>
          <div className="records-grid">
            <div className="record-card">
              <div className="rc-rank gold-rank">1</div>
              <div className="rc-body">
                <div className="rc-movie">RRR</div>
                <div className="rc-meta">SS Rajamouli · 2022</div>
                <div className="rc-bar-wrap"><div className="rc-bar" style={{ width: '100%' }}></div></div>
              </div>
              <div className="rc-amount">₹365.8Cr</div>
            </div>
            <div className="record-card">
              <div className="rc-rank">2</div>
              <div className="rc-body">
                <div className="rc-movie">Baahubali 2</div>
                <div className="rc-meta">SS Rajamouli · 2017</div>
                <div className="rc-bar-wrap"><div className="rc-bar" style={{ width: '85%' }}></div></div>
              </div>
              <div className="rc-amount">₹310Cr</div>
            </div>
            <div className="record-card">
              <div className="rc-rank">3</div>
              <div className="rc-body">
                <div className="rc-movie">Pushpa 2</div>
                <div className="rc-meta">Sukumar · 2024</div>
                <div className="rc-bar-wrap"><div className="rc-bar" style={{ width: '83%' }}></div></div>
              </div>
              <div className="rc-amount">₹302Cr</div>
            </div>
            <div className="record-card">
              <div className="rc-rank">4</div>
              <div className="rc-body">
                <div className="rc-movie">Kalki 2898 AD</div>
                <div className="rc-meta">Nag Ashwin · 2024</div>
                <div className="rc-bar-wrap"><div className="rc-bar" style={{ width: '79%' }}></div></div>
              </div>
              <div className="rc-amount">₹290Cr</div>
            </div>
            <div className="record-card">
              <div className="rc-rank">5</div>
              <div className="rc-body">
                <div className="rc-movie">Peddi</div>
                <div className="rc-meta">Buchi Babu Sana · 2026 · Running</div>
                <div className="rc-bar-wrap"><div className="rc-bar" style={{ width: '88%', background: 'var(--crimson)' }}></div></div>
              </div>
              <div className="rc-amount" style={{ color: 'var(--crimson)' }}>₹320Cr+</div>
            </div>
            <div className="record-card">
              <div className="rc-rank">6</div>
              <div className="rc-body">
                <div className="rc-movie">Salaar</div>
                <div className="rc-meta">Prashanth Neel · 2023</div>
                <div className="rc-bar-wrap"><div className="rc-bar" style={{ width: '58%' }}></div></div>
              </div>
              <div className="rc-amount">₹213.5Cr</div>
            </div>
          </div>

          {/* AP/TS AREA WISE */}
          <div className="sec-hdr">
            <div className="sec-title">AP/TS Area Wise Top 5</div>
            <span className="sec-link">All Areas →</span>
          </div>
          <div className="area-grid">
            <div className="area-card">
              <div className="area-hdr">
                <div className="area-name">Day 1 — AP/TS</div>
                <div className="area-total">All-Time</div>
              </div>
              <div className="area-row"><div className="area-pos">1</div><div className="area-movie">Pushpa 2</div><div className="area-share">₹74.33 Cr</div></div>
              <div className="area-row"><div className="area-pos">2</div><div className="area-movie">RRR</div><div className="area-share">₹73.99 Cr</div></div>
              <div className="area-row"><div className="area-pos">3</div><div className="area-movie">OG</div><div className="area-share">₹62.69 Cr</div></div>
              <div className="area-row"><div className="area-pos">4</div><div className="area-movie">Devara: Part 1</div><div className="area-share">₹61.25 Cr</div></div>
              <div className="area-row"><div className="area-pos">5</div><div className="area-movie">Salaar</div><div className="area-share">₹47.48 Cr</div></div>
            </div>
            <div className="area-card">
              <div className="area-hdr">
                <div className="area-name">Day 1 — Worldwide</div>
                <div className="area-total">All-Time</div>
              </div>
              <div className="area-row"><div className="area-pos">1</div><div className="area-movie">RRR</div><div className="area-share">₹108.79 Cr</div></div>
              <div className="area-row"><div className="area-pos">2</div><div className="area-movie">Pushpa 2</div><div className="area-share">₹105.33 Cr</div></div>
              <div className="area-row"><div className="area-pos">3</div><div className="area-movie">OG</div><div className="area-share">₹88.45 Cr</div></div>
              <div className="area-row"><div className="area-pos">4</div><div className="area-movie">Devara: Part 1</div><div className="area-share">₹87.45 Cr</div></div>
              <div className="area-row"><div className="area-pos">5</div><div className="area-movie">Kalki 2898 AD</div><div className="area-share">₹77.65 Cr</div></div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="sidebar">
          <div style={{ position: 'sticky', top: '70px', display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
            <div className="sw">
              <div className="sw-hdr"><div className="live-dot"></div><div className="sw-title">Today's Updates</div></div>
              {boxOfficeData?.slice(0, 5).map((film, idx) => (
                <Link to={`/box-office`} className="ud-row" key={film.id}>
                  <div className="ud-rank">{idx + 1}</div>
                  <div className="ud-body">
                    <div className="ud-movie">{film.movieName}</div>
                    <div className="ud-day">Day {film.days} · WW Gross</div>
                  </div>
                  <div className="ud-right">
                    <div className="ud-amt">{film.worldwideGross}</div>
                    <div className={`ud-trend ${getTrendClass(film.trend)}`}>
                      {film.trend}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="sw">
              <div className="sw-hdr"><div className="sw-title">Upcoming Releases</div></div>
              {upcomingSchedules?.slice(0, 4).map((schedule, idx) => (
                <div className="ud-row" key={idx}>
                  <div className="ud-body">
                    <div className="ud-movie">{schedule.movieName}</div>
                    <div className="ud-day">
                      {schedule.language} · {schedule.releaseDate ? new Date(schedule.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                    </div>
                  </div>
                  <div className="ud-right" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {getDaysRemainingText(schedule.releaseDate, schedule.status)}
                  </div>
                </div>
              ))}
            </div>

            <div className="sw">
              <div className="sw-hdr"><div className="sw-title">Quick Access</div></div>
              <div style={{ padding: '10px 13px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <Link to="/box-office" className="quick-link">AP/TS Day 1 Top 5 <span>→</span></Link>
                <Link to="/box-office" className="quick-link">AP/TS Week 1 Top 5 <span>→</span></Link>
                <Link to="/box-office" className="quick-link">WW Day 1 Top 10 <span>→</span></Link>
                <Link to="/box-office" className="quick-link">WW Closing Top 15 <span>→</span></Link>
                <Link to="/box-office" className="quick-link">Telugu Verdicts <span>→</span></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxOffice;
