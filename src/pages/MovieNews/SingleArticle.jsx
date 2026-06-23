import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getArticleBySlug, getArticles } from '../../services/api';

const SingleArticle = () => {
  const { slug } = useParams();
  const [scrollProgress, setScrollProgress] = useState(0);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getArticleBySlug(slug),
  });

  const { data: relatedNews } = useQuery({
    queryKey: ['relatedNews', article?.category],
    queryFn: () => getArticles({ category: article?.category, limit: 5 }),
    enabled: !!article,
  });

  useEffect(() => {
    const handleScroll = () => {
      const body = document.getElementById('artBody');
      if (body) {
        const rect = body.getBoundingClientRect();
        const total = body.offsetHeight;
        const scrolled = Math.max(0, -rect.top);
        const pct = Math.min(100, Math.round((scrolled / (total - window.innerHeight + 200)) * 100));
        setScrollProgress(isNaN(pct) ? 0 : pct);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  // Adjust display status based on client window width for responsive layout
  useEffect(() => {
    function checkWidth() {
      const w = window.innerWidth;
      const aside = document.getElementById('deskSidebar');
      const mobileInlines = document.querySelectorAll('.mob-sidebar-inline');
      if (aside) {
        if (w >= 700) {
          aside.style.display = 'block';
          mobileInlines.forEach((el) => { el.style.display = 'none'; });
        } else {
          aside.style.display = 'none';
          mobileInlines.forEach((el) => { el.style.display = 'block'; });
        }
      }
    }
    if (article) {
      checkWidth();
      window.addEventListener('resize', checkWidth);
    }
    return () => window.removeEventListener('resize', checkWidth);
  }, [article]);

  if (isLoading) {
    return (
      <div style={{ color: 'var(--muted)', padding: '100px 0', textAlign: 'center' }}>
        Loading Article...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ color: 'var(--text)', padding: '100px 0', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '32px' }}>Article Not Found</h2>
        <Link to="/movie-news" style={{ color: 'var(--gold)', marginTop: '10px', display: 'inline-block' }}>Back to Movie News</Link>
      </div>
    );
  }

  const isPeddiArticle = slug.includes('peddi');

  return (
    <>
      {/* READING PROGRESS */}
      <div className="read-progress">
        <div className="read-bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <div className="wrap">
        {/* BREADCRUMB */}
        <div className="breadcrumb">
          <Link to="/" className="bc-link">Home</Link>
          <span>/</span>
          <Link to="/movie-news" className="bc-link">Box Office News</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)' }}>
            {article.title.length > 25 ? `${article.title.slice(0, 22)}...` : article.title}
          </span>
        </div>

        <div className="art-layout">
          {/* ARTICLE */}
          <article>
            <div className="art-cat-badge">{article.category}</div>
            <h1 className="art-title">{article.title}</h1>
            <p className="art-deck">{article.excerpt}</p>

            <div className="art-byline">
              <div className="avatar">
                {article.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="byline-name">{article.author}</div>
                <div className="byline-meta">
                  <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="bdot">◆</span>
                  <span>5 min read</span>
                  <span className="bdot">◆</span>
                  <span>{article.category}</span>
                </div>
              </div>
              <div className="art-actions">
                <button className="act-btn">♡</button>
                <button className="act-btn">↗</button>
              </div>
            </div>

            {/* HERO */}
            <div className="art-hero-img" style={{ position: 'relative' }}>
              <img 
                src={article.featuredImage || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'}
                alt={article.title}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80';
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1
                }}
              />
              <div className="art-hero-text" style={{ position: 'relative', zIndex: 2 }}>
                {isPeddiArticle ? 'PEDDI' : article.category.toUpperCase()}
              </div>
            </div>
            <div className="img-caption">
              {isPeddiArticle ? "Ram Charan in Peddi (2026) — Directed by Buchi Babu Sana" : `${article.title}`}
            </div>

            {/* INLINE BOX OFFICE (mobile only) */}
            <div className="mob-sidebar-inline">
              <div className="sw">
                <div className="sw-hdr">
                  <div className="live-dot"></div>
                  <div className="sw-title">Live Box Office</div>
                </div>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">1</div>
                  <div className="bo-name2">Peddi</div>
                  <div className="bo-amt2">₹320 Cr</div>
                </Link>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">2</div>
                  <div className="bo-name2">Drishyam 3</div>
                  <div className="bo-amt2">₹236 Cr</div>
                </Link>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">3</div>
                  <div className="bo-name2">Karuppu</div>
                  <div className="bo-amt2">₹150 Cr</div>
                </Link>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">4</div>
                  <div className="bo-name2">Obsession</div>
                  <div className="bo-amt2">₹85 Cr</div>
                </Link>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">5</div>
                  <div className="bo-name2">Sing Geetham</div>
                  <div className="bo-amt2">₹5 Cr</div>
                </Link>
              </div>
            </div>

            {/* BODY CONTENT */}
            <div className="art-body" id="artBody">
              {article.content.map((block, idx) => {
                if (block.type === 'paragraph') {
                  return (
                    <React.Fragment key={idx}>
                      <p>{block.value}</p>
                      
                      {/* Insert mockup pullquote after 1st paragraph if it is the Peddi article */}
                      {isPeddiArticle && idx === 0 && (
                        <div className="pullquote">
                          <p>The second week alone contributed over ₹68 Cr to the worldwide tally — a remarkable hold that points to exceptional word of mouth and repeat viewing.</p>
                          <cite>— CHITRAMBHALARE Box Office Desk</cite>
                        </div>
                      )}

                      {/* Insert mockup collections table after 2nd paragraph if it is the Peddi article */}
                      {isPeddiArticle && idx === 1 && (
                        <div className="bo-table-wrap">
                          <div className="bo-table-hdr">
                            <div className="bo-table-hdr-title">Peddi — Worldwide Gross Collections</div>
                          </div>
                          <div className="table-scroll">
                            <table className="bo-table">
                              <thead>
                                <tr><th>#</th><th>Period</th><th>WW Gross</th><th>Telugu Share</th><th>Trend</th></tr>
                              </thead>
                              <tbody>
                                <tr><td className="rank">1</td><td>Day 1 Opening</td><td className="amt">₹73 Cr</td><td>₹42 Cr</td><td className="trend-up">▲ Record</td></tr>
                                <tr><td className="rank">2</td><td>First Weekend</td><td className="amt">₹190 Cr</td><td>₹108 Cr</td><td className="trend-up">▲ Strong</td></tr>
                                <tr><td className="rank">3</td><td>First Week</td><td className="amt">₹252 Cr</td><td>₹164 Cr</td><td className="trend-up">▲ Solid</td></tr>
                                <tr><td className="rank">4</td><td>Second Weekend</td><td className="amt">₹290 Cr</td><td>₹180 Cr</td><td className="trend-up">▲ Holding</td></tr>
                                <tr><td className="rank">5</td><td>Two Weeks</td><td className="amt">₹320 Cr+</td><td>₹195 Cr+</td><td className="trend-up">▲ Running</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                } else if (block.type === 'image') {
                  return (
                    <figure key={idx} className="my-8">
                      <img 
                        src={block.value} 
                        alt="visual content" 
                        className="w-full rounded-xl" 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    </figure>
                  );
                }
                return null;
              })}
            </div>

            {/* TAGS */}
            <div className="art-tags">
              {article.tags?.map((tag) => (
                <Link to={`/movie-news?search=${tag}`} key={tag} className="atag">
                  {tag}
                </Link>
              ))}
            </div>

            {/* SHARE BAR */}
            <div className="share-bar">
              <span className="share-lbl">Share:</span>
              <button className="share-btn" onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>Facebook</button>
              <button className="share-btn" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}>Twitter</button>
              <button className="share-btn" onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`, '_blank')}>WhatsApp</button>
              <button className="share-btn" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
              }}>Copy Link</button>
            </div>

            {/* AUTHOR BIO */}
            <div className="author-box">
              <div className="author-av">{article.author.slice(0, 2).toUpperCase()}</div>
              <div>
                <div className="author-name">{article.author}</div>
                <div className="author-role">Senior Editor, {article.category}</div>
                <div className="author-bio">
                  {article.author} covers box office collections and trade analysis for Chitrambhalare. With 8+ years tracking Telugu cinema, they are known for detailed data breakdowns and sharp verdict analysis.
                </div>
              </div>
            </div>

            {/* RELATED ARTICLES */}
            <div className="related-title">Related Articles</div>
            <div className="related-grid">
              {relatedNews?.data.filter(n => n.id !== article.id).slice(0, 4).map((rel) => (
                <Link to={`/movie-news/${rel.slug}`} key={rel.id} className="rel-card">
                  <div className="rel-thumb" style={{ background: '#0d1b30', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {rel.thumbnail ? (
                      <img 
                        src={rel.thumbnail} 
                        alt={rel.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      '🎬'
                    )}
                  </div>
                  <div className="rel-body">
                    <div className="rel-cat">{rel.category}</div>
                    <div className="rel-title">{rel.title}</div>
                    <div className="rel-date">
                      {new Date(rel.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          {/* DESKTOP SIDEBAR */}
          <aside style={{ display: 'none' }} id="deskSidebar">
            <div style={{ position: 'sticky', top: '76px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="sw">
                <div className="sw-hdr">
                  <div className="live-dot"></div>
                  <div className="sw-title">Live Box Office</div>
                </div>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">1</div>
                  <div className="bo-name2">Peddi</div>
                  <div className="bo-amt2">₹320 Cr</div>
                </Link>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">2</div>
                  <div className="bo-name2">Drishyam 3</div>
                  <div className="bo-amt2">₹236 Cr</div>
                </Link>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">3</div>
                  <div className="bo-name2">Karuppu</div>
                  <div className="bo-amt2">₹150 Cr</div>
                </Link>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">4</div>
                  <div className="bo-name2">Obsession</div>
                  <div className="bo-amt2">₹85 Cr</div>
                </Link>
                <Link to="/box-office" className="bo-row">
                  <div className="bo-rank2">5</div>
                  <div className="bo-name2">Sing Geetham</div>
                  <div className="bo-amt2">₹5 Cr</div>
                </Link>
              </div>

              <div className="sw">
                <div className="sw-hdr">
                  <div className="sw-title">You May Also Like</div>
                </div>
                <Link to="/box-office" className="pop-item">
                  <div className="pop-num">1</div>
                  <div>
                    <div className="pop-text">All Time Worldwide Top 15 Telugu Movies</div>
                    <div className="pop-meta">Records</div>
                  </div>
                </Link>
                <Link to="/movie-news/dhurandhar-unedited-version-streams-on-netflix-june-19" className="pop-item">
                  <div className="pop-num">2</div>
                  <div>
                    <div className="pop-text">Drishyam 3 — ₹236 Cr in 24 Days Worldwide</div>
                    <div className="pop-meta">Box Office</div>
                  </div>
                </Link>
                <Link to="/reviews" className="pop-item">
                  <div className="pop-num">3</div>
                  <div>
                    <div className="pop-text">Peddi Review: Ram Charan Powers Engaging Drama</div>
                    <div className="pop-meta">Review</div>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default SingleArticle;
