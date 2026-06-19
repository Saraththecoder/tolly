import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getArticles } from '../../services/api';

const CATEGORIES = [
  { name: 'All', value: 'All' },
  { name: 'Casting', value: 'Casting' },
  { name: 'Release Dates', value: 'Release Date' },
  { name: 'OTT Dates', value: 'OTT' },
  { name: 'Re-Release', value: 'Re-Release' },
  { name: 'Production', value: 'Production' }
];

const MovieNews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const category = searchParams.get('category') || 'All';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['articles', { category, page, search }],
    queryFn: () => getArticles({ 
      page, 
      limit: 12, 
      category: category === 'All' ? null : category,
      search
    }),
  });

  const handleCategoryChange = (catVal) => {
    setSearchParams({ category: catVal, page: '1' });
  };

  const handlePageChange = (newPage) => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...params, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allFetchedArticles = data?.data || [];
  const featuredArticle = page === 1 && allFetchedArticles[0] ? allFetchedArticles[0] : null;
  const sideArticles = page === 1 ? allFetchedArticles.slice(1, 4) : [];
  const gridArticles = page === 1 ? allFetchedArticles.slice(4) : allFetchedArticles;

  return (
    <div className="wrap">
      <Helmet>
        <title>Movie News | CHITRAMBHALARE</title>
        <meta name="description" content="Browse the latest updates, casting news, release dates, and production rumors from Tollywood." />
      </Helmet>

      {/* Breadcrumb */}
      <div style={{ padding: '12px 0 0', fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Link to="/" style={{ cursor: 'pointer', color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--text)' }}>Movie News</span>
      </div>

      {/* Category Banner */}
      <div className="cat-banner">
        <div>
          <div className="cat-eyebrow">Browse Category</div>
          <div className="cat-title">Movie News</div>
          <div className="cat-desc">Latest updates, announcements, casting & release dates from Tollywood.</div>
          <div className="cat-stats">
            <div><div className="cat-stat-val">2,400+</div><div className="cat-stat-lbl">Articles</div></div>
            <div><div className="cat-stat-val">Daily</div><div className="cat-stat-lbl">Updates</div></div>
            <div><div className="cat-stat-val">12</div><div className="cat-stat-lbl">Today</div></div>
          </div>
        </div>
        <div className="cat-icon">NEWS</div>
      </div>

      <div className="desktop-grid">
        <div>
          {/* Filter tabs */}
          <div className="filter-scroll">
            <div className="filter-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  className={`ftab ${category === cat.value ? 'on' : ''}`}
                  onClick={() => handleCategoryChange(cat.value)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>
              Loading Movie News...
            </div>
          ) : allFetchedArticles.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', background: 'var(--card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted)' }}>No articles found. Try another category or search term.</p>
            </div>
          ) : (
            <>
              {/* Featured Section */}
              {featuredArticle && (
                <>
                  <div className="section-hdr">
                    <div className="section-hdr-title">Featured</div>
                    <span className="see-all">See all →</span>
                  </div>
                  <Link to={`/movie-news/${featuredArticle.slug}`} className="feat-main" style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="feat-img">
                      {featuredArticle.title.split(' ')[0]}
                      <div className="feat-badge">🔥 Top Story</div>
                    </div>
                    <div className="feat-body">
                      <div className="feat-title">{featuredArticle.title}</div>
                      <div className="feat-excerpt">{featuredArticle.excerpt}</div>
                      <div className="feat-meta">
                        <span>By {featuredArticle.author}</span>
                        <span className="dot">◆</span>
                        <span>{new Date(featuredArticle.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span className="dot">◆</span>
                        <span>3 min read</span>
                      </div>
                    </div>
                  </Link>
                </>
              )}

              {/* Side Scroll Section */}
              {sideArticles.length > 0 && (
                <div className="side-scroll">
                  {sideArticles.map((art) => (
                    <Link to={`/movie-news/${art.slug}`} key={art.id} className="side-card">
                      <div className="side-cat">{art.category}</div>
                      <div className="side-title">{art.title}</div>
                      <div className="side-date">
                        {new Date(art.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Mobile Sidebar (Box Office lists inline on mobile) */}
              <div className="mobile-sidebar">
                <div className="sw">
                  <div className="sw-hdr">
                    <div className="live-dot"></div>
                    <div className="sw-title">Live Box Office</div>
                  </div>
                  <Link to="/box-office" className="bo-row">
                    <div className="bo-rank">1</div>
                    <div className="bo-name">Peddi</div>
                    <div className="bo-amt">₹320 Cr</div>
                  </Link>
                  <Link to="/box-office" className="bo-row">
                    <div className="bo-rank">2</div>
                    <div className="bo-name">Drishyam 3</div>
                    <div className="bo-amt">₹236 Cr</div>
                  </Link>
                  <Link to="/box-office" className="bo-row">
                    <div className="bo-rank">3</div>
                    <div className="bo-name">Obsession</div>
                    <div className="bo-amt">₹85 Cr</div>
                  </Link>
                  <Link to="/box-office" className="bo-row">
                    <div className="bo-rank">4</div>
                    <div className="bo-name">Hai Jawani Toh Ishq</div>
                    <div className="bo-amt">₹55 Cr</div>
                  </Link>
                </div>
              </div>

              {/* All News Grid */}
              {gridArticles.length > 0 && (
                <>
                  <div className="section-hdr">
                    <div className="section-hdr-title">All Movie News</div>
                    <span className="see-all">2,400+ →</span>
                  </div>
                  <div className="news-grid">
                    {gridArticles.map((art) => (
                      <Link to={`/movie-news/${art.slug}`} key={art.id} className="n-card">
                        <div className="n-thumb" style={{ background: '#0d1b30' }}>🎬</div>
                        <div className="n-body">
                          <div className="n-cat">{art.category}</div>
                          <div className="n-title">{art.title}</div>
                          <div className="n-meta">
                            {new Date(art.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pg-btn" 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    ‹
                  </button>
                  {[...Array(data.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`pg-btn ${page === i + 1 ? 'cur' : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    className="pg-btn" 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === data.totalPages}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="sidebar-desktop" style={{ display: 'none' }}>
          <div style={{ position: 'sticky', top: '76px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="sw">
              <div className="sw-hdr">
                <div className="live-dot"></div>
                <div className="sw-title">Live Box Office</div>
              </div>
              <Link to="/box-office" className="bo-row">
                <div className="bo-rank">1</div>
                <div className="bo-name">Peddi</div>
                <div className="bo-amt">₹320 Cr</div>
              </Link>
              <Link to="/box-office" className="bo-row">
                <div className="bo-rank">2</div>
                <div className="bo-name">Drishyam 3</div>
                <div className="bo-amt">₹236 Cr</div>
              </Link>
              <Link to="/box-office" className="bo-row">
                <div className="bo-rank">3</div>
                <div className="bo-name">Obsession</div>
                <div className="bo-amt">₹85 Cr</div>
              </Link>
              <Link to="/box-office" className="bo-row">
                <div className="bo-rank">4</div>
                <div className="bo-name">Hai Jawani Toh Ishq</div>
                <div className="bo-amt">₹55 Cr</div>
              </Link>
            </div>
            
            <div className="sw">
              <div className="sw-hdr">
                <div className="sw-title">Popular Stories</div>
              </div>
              <Link to="/movie-news/peddi-crosses-320-cr-worldwide-in-2-weeks-telugu-dominates" className="pop-item">
                <div className="pop-num">1</div>
                <div>
                  <div className="pop-text">Peddi Joins the ₹300 Cr Club at the Box Office</div>
                  <div className="pop-meta">Box Office · June 14</div>
                </div>
              </Link>
              <Link to="/movie-news/chiranjeevi-venkatesh-rumors-films-not-postponed" className="pop-item">
                <div className="pop-num">2</div>
                <div>
                  <div className="pop-text">Chiranjeevi & Venkatesh Rumors: Films Not Postponed</div>
                  <div className="pop-meta">Movie News · June 18</div>
                </div>
              </Link>
              <Link to="/movie-news/dhurandhar-unedited-version-streams-on-netflix-june-19" className="pop-item">
                <div className="pop-num">3</div>
                <div>
                  <div className="pop-text">Dhurandhar Unedited Version Streams on Netflix June 19</div>
                  <div className="pop-meta">OTT · June 18</div>
                </div>
              </Link>
            </div>

            <div className="sw">
              <div className="sw-hdr">
                <div className="sw-title">Browse Topics</div>
              </div>
              <div className="tag-cloud">
                <Link to="/movie-news?search=Ram Charan" className="tag">Ram Charan</Link>
                <Link to="/movie-news?search=Pawan Kalyan" className="tag">Pawan Kalyan</Link>
                <Link to="/movie-news?search=Chiranjeevi" className="tag">Chiranjeevi</Link>
                <Link to="/movie-news?category=OTT" className="tag">OTT</Link>
                <Link to="/box-office" className="tag">Box Office</Link>
                <Link to="/reviews" className="tag">Reviews</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Cloud (Mobile Only) */}
      <div className="mobile-sidebar">
        <div className="sw">
          <div className="sw-hdr">
            <div className="sw-title">Browse Topics</div>
          </div>
          <div className="tag-cloud">
            <Link to="/movie-news?search=Ram Charan" className="tag">Ram Charan</Link>
            <Link to="/movie-news?search=Pawan Kalyan" className="tag">Pawan Kalyan</Link>
            <Link to="/movie-news?search=Chiranjeevi" className="tag">Chiranjeevi</Link>
            <Link to="/movie-news?category=OTT" className="tag">OTT</Link>
            <Link to="/box-office" className="tag">Box Office</Link>
            <Link to="/reviews" className="tag">Reviews</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieNews;
